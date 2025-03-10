import React, { useRef, useEffect, useMemo, useState } from "react";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { useVisibility } from "./toggleMenu";
import humanLogo from "../img/outline-human-body-mens-figure-in-linear-style-the-outline-of-a-young-man-black-and-white-silho.png";

const DiagramLED = () => {
  // Get visibility state from context with fallback values
  const { visibleElements = {} } = useVisibility();

  // Ensure we have default values if visibleElements is undefined
  const safeVisibility = {
    floorLine: true,
    centreLine: true,
    woodBacking: true,
    receptacleBox: true,
    ...visibleElements,
  };

  // Add constants for better maintainability
  const COLORS = {
    primary: "#000000",
    highlight: "#000000",
    accent: "#FFA500",
    background: "#ffffff",
  };

  //SVG ref for coordinate conversion
  const svgRef = useRef(null);

  // Get all state and methods from the store
  const {
    isHorizontal,
    isNiche,
    selectedReceptacleBox,
    selectedMediaPlayer,
    selectedMount,
    selectedScreen,
    variantDepth,

    // Receptacle boxes state and methods
    receptacleBoxes,
    boxCount,
    activeBoxId,
    setStartDragInfo,
    updateBoxPosition,
    endDrag,
    BOX_WIDTH,
    BOX_HEIGHT,
    floorDistance,

    //Methods
    updateBoundary,
    repositionBoxes,
  } = useSheetDataStore();

  //Get dimensions from selected screen and parse as numbers
  const rawWidth = parseFloat(selectedScreen?.["Width"] || 0);
  const rawHeight = parseFloat(selectedScreen?.["Height"] || 0);
  const depth = parseFloat(selectedScreen?.["Depth"] || 0);

  // Determine width and height based on orientation
  // If vertical (isHorizontal = false), swap width and height
  const width = isHorizontal ? rawWidth : rawHeight;
  const height = isHorizontal ? rawHeight : rawWidth;

  // Calculate niche dimensions with proper margins
  const nicheWidthExtra = width < 55 ? 1.5 : 2; // Add 1.5 or 2 inches on each side
  const nicheHeightExtra = height < 55 ? 1.5 : 2; // Add 1.5 or 2 inches on each side
  const nicheWidth = rawWidth + nicheWidthExtra;
  const nicheHeight = rawHeight + nicheHeightExtra;

  const DirnicheWidth = isHorizontal ? nicheWidth : nicheHeight;
  const DirnicheHeight = isHorizontal ? nicheHeight : nicheWidth;
  
  // Base dimensions for the diagram area
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 800;
  
  // Maximum dimensions for the screen in the SVG
  const MAX_SCREEN_WIDTH = 500;
  const MAX_SCREEN_HEIGHT = 400; // Reduced from 800 to ensure it fits better

  // Dynamic scaling factor based on screen size
  // This will automatically scale down larger screens to fit
  const widthScaleFactor = Math.min(10, MAX_SCREEN_WIDTH / Math.max(width, 1));
  const heightScaleFactor = Math.min(10, MAX_SCREEN_HEIGHT / Math.max(height, 1));
  
  // Use the smaller of the two scale factors to maintain aspect ratio
  const SCALE_FACTOR = Math.min(widthScaleFactor, heightScaleFactor);

  // Calculate screen dimensions in pixels with adaptive scaling
  const screenWidthPx = Math.max(100, width * SCALE_FACTOR);
  const screenHeightPx = Math.max(100, height * SCALE_FACTOR);

  // Calculate niche dimensions in pixels
  const nicheWidthPx = screenWidthPx + nicheWidthExtra * SCALE_FACTOR;
  const nicheHeightPx = screenHeightPx + nicheHeightExtra * SCALE_FACTOR;

  // Calculate center positions - ensure we have enough margin on all sides
  const centerX = BASE_WIDTH / 2;
  const centerY = 300; // Center position for the screen

  // Calculate screen position (centered)
  const screenX = centerX - screenWidthPx / 2;
  const screenY = centerY - screenHeightPx / 2;

  // Calculate niche position (centered around screen)
  const nicheX = centerX - nicheWidthPx / 2;
  const nicheY = centerY - nicheHeightPx / 2;

  // Wood backing dimensions (slightly smaller than screen)
  const woodBackingMargin = 30;
  const woodBackingX = screenX + woodBackingMargin;
  const woodBackingY = screenY + woodBackingMargin;
  const woodBackingWidth = screenWidthPx - woodBackingMargin * 2;
  const woodBackingHeight = screenHeightPx - woodBackingMargin * 2;

  // Side view dimensions - scaled with the screen depth but with minimum and maximum
  const sideViewX = BASE_WIDTH + 10; // Place it just outside the main view
  const sideViewY = screenY - 14;
  const sideViewHeight = nicheHeightPx;
  const sideViewDepth = Math.max(25, Math.min(50, depth * SCALE_FACTOR));

  // Update draggable boundary based on screen dimensions
  const draggableBoundary = useMemo(() => {
    return {
      x: screenX,
      y: screenY,
      width: screenWidthPx,
      height: screenHeightPx,
    };
  }, [screenX, screenY, screenWidthPx, screenHeightPx]);

  // Adjust viewport dimensions to accommodate the diagram
  // This is crucial to ensure everything is visible
  const viewBoxWidth = BASE_WIDTH + sideViewDepth + 60; // Add extra space for side view
  const viewBoxHeight = Math.max(700, screenY + screenHeightPx + 200); // Ensure enough vertical space

  // Effect to update the boundary in the store when screen dimensions change
  useEffect(() => {
    // Update the boundary in the store
    updateBoundary(draggableBoundary);

    // Reposition any boxes that are now outside the boundary
    repositionBoxes();
  }, [draggableBoundary, updateBoundary, repositionBoxes]);

  // Convert client coordinates to SVG coordinates
  const clientToSVGCoordinates = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;

    const point = svgPoint.matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };

  // Start dragging
  const startDrag = (event, id) => {
    event.preventDefault();

    if (!svgRef.current) return;

    const box = receptacleBoxes.find((box) => box.id === id);
    if (!box) return;

    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    setStartDragInfo(id, point, { x: box.x, y: box.y });

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle drag
  const handleDrag = (event) => {
    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    updateBoxPosition(point);
  };

  // End dragging
  const handleMouseUp = () => {
    endDrag();
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Draw the boundary box for debugging (comment out in production)
  const showBoundaryBox = false; // Set to true to see the boundary

  // Determine what text to display for dimensions
  const widthLabel = isHorizontal ? "Width" : "Height";
  const heightLabel = isHorizontal ? "Height" : "Width";

  // Get raw dimension values for labels
  const rawWidthValue = rawWidth.toFixed(1);
  const rawHeightValue = rawHeight.toFixed(1);

  // Calculate floor line position
  const floorLineY = 643;
  
  // Calculate the position for the human figure
  const humanX = centerX - 50; // Center the human figure horizontally
  const humanY = floorLineY - 340; // Position relative to floor line
  const humanWidth = 800;
  const humanHeight = 320;

  return (
    <div className="w-full flex justify-center bg-white flex-col text-center p-4 ml-0">
      <div className="mb-0 flex justify-start text-start">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          style={{ touchAction: "none", backgroundColor: "F0F0F9" }}
        >
          <title>LED Display Installation Diagram</title>
          <desc>
            Technical diagram showing LED display mounting specifications and
            measurements
          </desc>

          {/* Grid background */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#CCCCCC"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1" />

          {/* Draggable boundary visualization (for debugging) */}
          {showBoundaryBox && (
            <rect
              x={draggableBoundary.x}
              y={draggableBoundary.y}
              width={draggableBoundary.width}
              height={draggableBoundary.height}
              fill="none"
              stroke="red"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          )}
          
          {/* Human figure for scale reference */}
          <image 
            href={humanLogo} 
            x={humanX}
            y={humanY}
            height={humanHeight}
            width={humanWidth}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Niche (outer box) - only visible if isNiche is true */}
          {isNiche && (
            <>
              {/* Niche rectangle - dynamically sized */}
              <rect
                x={nicheX}
                y={nicheY}
                width={nicheWidthPx}
                height={nicheHeightPx}
                fill="none"
                stroke="black"
                strokeWidth="1"
              />

              {/* Niche width label */}
              <text x="70" y="280" textAnchor="middle" fontSize="12">
                {DirnicheHeight.toFixed(1)}
              </text>

              {/* Bottom measurement for niche */}
              <line
                x1={nicheX + 6}
                y1={nicheY + nicheHeightPx + 40}
                x2={nicheX + nicheWidthPx - 6}
                y2={nicheY + nicheHeightPx + 40}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />

              <line
                x1={nicheX}
                y1={nicheY + nicheHeightPx}
                x2={nicheX}
                y2={nicheY + nicheHeightPx + 40}
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
              <line
                x1={nicheX + nicheWidthPx}
                y1={nicheY + nicheHeightPx}
                x2={nicheX + nicheWidthPx}
                y2={nicheY + nicheHeightPx + 40}
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />

              <text
                x="370"
                y={nicheY + nicheHeightPx + 70}
                textAnchor="middle"
                fontSize="12"
              >
                {DirnicheWidth.toFixed(1)}
              </text>

              {/* Left measurement for niche */}
              <line
                x1={nicheX - 40}
                y1={nicheY + 6}
                x2={nicheX - 40}
                y2={nicheY + nicheHeightPx - 6}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />

              <line
                x1={nicheX - 40}
                y1={nicheY}
                x2={nicheX}
                y2={nicheY}
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
              <line
                x1={nicheX - 40}
                y1={nicheY + nicheHeightPx}
                x2={nicheX}
                y2={nicheY + nicheHeightPx}
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />

              {/* Side view - scaled with depth */}
              <text x={sideViewX - 5} y={sideViewY + sideViewHeight + 30} textAnchor="start" fontSize="12">
                Side View
              </text>

              <line
                x1={sideViewX}
                y1={sideViewY}
                x2={sideViewX}
                y2={sideViewY + sideViewHeight}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1={sideViewX + sideViewDepth}
                y1={sideViewY}
                x2={sideViewX + sideViewDepth}
                y2={sideViewY + sideViewHeight}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1={sideViewX + sideViewDepth + 6}
                y1={sideViewY}
                x2={sideViewX + sideViewDepth + 6}
                y2={sideViewY + sideViewHeight}
                stroke="black"
                strokeWidth="1"
              />

              {/* Top and bottom lines of side view */}
              <line
                x1={sideViewX}
                y1={sideViewY}
                x2={sideViewX + sideViewDepth}
                y2={sideViewY}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1={sideViewX}
                y1={sideViewY + sideViewHeight}
                x2={sideViewX + sideViewDepth}
                y2={sideViewY + sideViewHeight}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1={sideViewX + sideViewDepth}
                y1={sideViewY + sideViewHeight}
                x2={sideViewX + sideViewDepth + 6}
                y2={sideViewY + sideViewHeight}
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1={sideViewX + sideViewDepth}
                y1={sideViewY}
                x2={sideViewX + sideViewDepth + 6}
                y2={sideViewY}
                stroke="black"
                strokeWidth="1"
              />

              {/* Side view measurement */}
              <line
                x1={sideViewX - 10}
                y1={sideViewY + 6}
                x2={sideViewX - 10}
                y2={sideViewY + sideViewHeight - 6}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />

              <line
                x1={sideViewX + sideViewDepth + 15}
                y1={sideViewY + 2}
                x2={sideViewX + sideViewDepth + 15}
                y2={sideViewY + sideViewHeight - 2}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
            </>
          )}

          {/* Main Rectangle - Screen (dynamically sized) */}
          <rect
            x={screenX}
            y={screenY}
            width={screenWidthPx}
            height={screenHeightPx}
            fill="none"
            stroke="black"
            strokeWidth="2"
            opacity="1"
          />

          {/* Wood Backing - Inner rectangle (only if visible) */}
          {safeVisibility.woodBacking && (
            <rect
              x={woodBackingX}
              y={woodBackingY}
              width={woodBackingWidth}
              height={woodBackingHeight}
              fill="none"
              stroke="black"
              strokeDasharray="8,8"
              strokeWidth="1"
            />
          )}

          {/* Centerline (Vertical) */}
          {safeVisibility.centreLine && (
            <>
              <line
                x1={centerX}
                y1="50"
                x2={centerX}
                y2="590"
                stroke="black"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <line
                x1={centerX}
                y1={centerY}
                x2="435"
                y2="53"
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="435"
                y1="53"
                x2="453"
                y2="53"
                stroke="black"
                strokeWidth="1"
              />
              <text x="595" y="50" textAnchor="end" fontSize="12">
                Intended Screen Position
              </text>
            </>
          )}

          {/* Centerline (Horizontal) */}
          {safeVisibility.centreLine && (
            <line
              x1="50"
              y1={centerY}
              x2="760"
              y2={centerY}
              stroke="black"
              strokeWidth="1"
              strokeDasharray="4"
            />
          )}

          {/* Draggable Receptacle Boxes */}
          {safeVisibility.receptacleBox &&
            receptacleBoxes.map((box, index) => (
              <g
                key={box.id}
                onMouseDown={(e) => startDrag(e, box.id)}
                style={{ cursor: "move" }}
              >
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={COLORS.background}
                  stroke={COLORS.highlight}
                  strokeWidth="1.5"
                />
                <text
                  x={box.x + box.width / 2}
                  y={box.y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={COLORS.highlight}
                >
                  Box {index + 1}
                </text>
              </g>
            ))}

          {/* Leader line for receptacle box - only if boxes exist */}
          {safeVisibility.receptacleBox && receptacleBoxes.length > 0 && (
            <>
              <line
                x1={receptacleBoxes[0].x + 15}
                y1={receptacleBoxes[0].y + 15}
                x2="455"
                y2="80"
                stroke="black"
                strokeWidth="1"
                markerStart="url(#circle)"
              />
              <line
                x1="455"
                y1="80"
                x2="493"
                y2="80"
                stroke="black"
                strokeWidth="1"
              />
              <text x="495" y="78" textAnchor="start" fontSize="12">
                Install recessed receptacle box
              </text>
            </>
          )}

          {/* Circle Marker Definition */}
          <defs>
            <marker
              id="circle"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <circle cx="5" cy="5" r="3" fill="black" />
            </marker>
          </defs>

          {/* Top measurement for screen width */}
          <line
            x1={screenX + 6}
            y1={screenY - 40}
            x2={screenX + screenWidthPx - 6}
            y2={screenY - 40}
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          <line
            x1={screenX}
            y1={screenY - 40}
            x2={screenX}
            y2={screenY}
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          <line
            x1={screenX + screenWidthPx}
            y1={screenY - 40}
            x2={screenX + screenWidthPx}
            y2={screenY}
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          
          <text
            x={centerX - 50}
            y={screenY - 60}
            textAnchor="middle"
            fontSize="12"
          >
            {isHorizontal ? rawWidthValue : rawHeightValue} (Width)
          </text>

          {/* Floor Distance label */}
          <text x="50" y="330" textAnchor="middle" fontSize="12">
            {floorDistance || "50"}
          </text>
          <text x="50" y="340" textAnchor="middle" fontSize="12">
            <tspan x="50" y="345">
              Centerline of
            </tspan>
            <tspan x="50" dy="12">
              display
            </tspan>
          </text>

          {/* Right side measurement for screen height */}
          <line
            x1={screenX + screenWidthPx + 40}
            y1={screenY + 6}
            x2={screenX + screenWidthPx + 40}
            y2={screenY + screenHeightPx - 6}
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          <line
            x1={screenX + screenWidthPx}
            y1={screenY}
            x2={screenX + screenWidthPx + 40}
            y2={screenY}
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          <line
            x1={screenX + screenWidthPx}
            y1={screenY + screenHeightPx}
            x2={screenX + screenWidthPx + 40}
            y2={screenY + screenHeightPx}
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />

          <text
            x={screenX + screenWidthPx + 90}
            y={centerY - 10}
            textAnchor="middle"
            fontSize="12"
          >
            {isHorizontal ? rawHeightValue : rawWidthValue} (Height)
          </text>

          {/* Floor Line */}
          <line
            x1="90"
            y1={floorLineY}
            x2="700"
            y2={floorLineY}
            stroke="black"
            strokeWidth="1"
          />

          {/* Floor Line Measurement */}
          {safeVisibility.floorLine && (
            <>
              <line
                x1="90"
                y1={centerY + 7}
                x2="90"
                y2={floorLineY - 3}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
              <text x="30" y={floorLineY - 23} textAnchor="middle" fontSize="12">
                Floor Line
              </text>
            </>
          )}

          {/* Arrow Definitions */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="black" />
            </marker>
            <marker
              id="arrowReversed"
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M10,0 L0,5 L10,10 z" fill="black" />
            </marker>
          </defs>

          {/* Center point circle at intersection of centerlines */}
          {safeVisibility.centreLine && (
            <>
              <circle
                cx={centerX}
                cy={centerY}
                r="5"
                fill="none"
                stroke="black"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r="3"
                fill="yellow"
                stroke="black"
              />
            </>
          )}
        </svg>
      </div>

      <div className="w-full flex text-left flex-col mt-0 h-80 border-gray-400 border-2 p-4 justify-center">
        <p className="mb-1 text-xl font-bold">Notes:</p>
        <textarea className="border-0 w-full h-full resize-none focus:outline-none"></textarea>
      </div>
    </div>
  );
};

export default DiagramLED;