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

    // Wall dimensions
    wallWidth,
    wallHeight,

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

  // Convert inches to meters for the screen
  const INCHES_TO_METERS = 0.0254;
  const screenWidthMeters = rawWidth * INCHES_TO_METERS;
  const screenHeightMeters = rawHeight * INCHES_TO_METERS;

  // Determine width and height based on orientation
  // If vertical (isHorizontal = false), swap width and height
  const width = isHorizontal ? rawWidth : rawHeight;
  const height = isHorizontal ? rawHeight : rawWidth;
  const screenWidthOrientedMeters = isHorizontal ? screenWidthMeters : screenHeightMeters;
  const screenHeightOrientedMeters = isHorizontal ? screenHeightMeters : screenWidthMeters;

  // Base dimensions for the diagram area
  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 900;
  
  // Define pixels per meter for the wall
  const WALL_SCALE = 110; // Pixels per meter for the wall
  
  // Wall dimensions in pixels
  const wallWidthPx = wallWidth * WALL_SCALE;
  const wallHeightPx = wallHeight * WALL_SCALE;
  
  // Scaling factor for the LED display relative to the wall
  // This creates the effect where the screen gets smaller as the wall gets larger
  const screenToWallWidthRatio = screenWidthOrientedMeters / wallWidth;
  const screenToWallHeightRatio = screenHeightOrientedMeters / wallHeight;
  
  // Calculate screen dimensions in pixels - scaled relative to the wall
  const screenWidthPx = wallWidthPx * screenToWallWidthRatio;
  const screenHeightPx = wallHeightPx * screenToWallHeightRatio;
  
  // Calculate niche dimensions with proper margins
  const nicheWidthExtra = width < 55 ? 1.5 : 2; // Add 1.5 or 2 inches on each side
  const nicheHeightExtra = height < 55 ? 1.5 : 2; // Add 1.5 or 2 inches on each side
  
  // Convert niche margins to meters, then to pixels at wall scale
  const nicheWidthExtraPx = nicheWidthExtra * INCHES_TO_METERS * WALL_SCALE;
  const nicheHeightExtraPx = nicheHeightExtra * INCHES_TO_METERS * WALL_SCALE;
  
  // Calculate niche dimensions in pixels, accounting for extra margins on both sides
  const nicheWidthPx = screenWidthPx + (nicheWidthExtraPx * 2);
  const nicheHeightPx = screenHeightPx + (nicheHeightExtraPx * 2);
  
  // Wall position
  const wallX = BASE_WIDTH / 2 - wallWidthPx / 2;
  const wallY = 100;
  
  // Calculate center positions
  const centerX = BASE_WIDTH / 2;
  const centerY = wallY + wallHeightPx / 2; // Center of the wall
  
  // Calculate screen position (centered in the wall)
  const screenX = centerX - (screenWidthPx / 2);
  const screenY = centerY - (screenHeightPx / 2);
  
  // Calculate niche position (centered around screen)
  const nicheX = centerX - (nicheWidthPx / 2);
  const nicheY = centerY - (nicheHeightPx / 2);
  
  // Wood backing dimensions (slightly smaller than screen)
  const woodBackingMargin = Math.max(5, screenWidthPx * 0.05); // Adaptive margin
  const woodBackingX = screenX + woodBackingMargin;
  const woodBackingY = screenY + woodBackingMargin;
  const woodBackingWidth = screenWidthPx - (woodBackingMargin * 2);
  const woodBackingHeight = screenHeightPx - (woodBackingMargin * 2);

  // Side view dimensions - scale with the screen
  const sideViewX = wallX + wallWidthPx + 10; // Position to the right of the wall
  const sideViewY = screenY;
  const sideViewHeight = nicheHeightPx;
  // Scale the depth based on wall scale too
  const sideViewDepth = depth * INCHES_TO_METERS * WALL_SCALE;

  // Calculate floor line position at bottom of wall
  const floorLineY = wallY + wallHeightPx;
  
  // Human figure position and size - scaled based on wall dimensions
  // Average human height is about 1.75 meters
  const HUMAN_HEIGHT_METERS = 1.75;
  const humanScale = HUMAN_HEIGHT_METERS / wallHeight;
  const humanHeightPx = wallHeightPx * humanScale;
  const humanWidthPx = humanHeightPx * 0.27; // Width to height ratio
  const humanX = wallX + wallWidthPx * 1.05; // Position at 75% of wall width
  const humanY = floorLineY - humanHeightPx; // Position at floor level

  // Update draggable boundary based on screen dimensions
  const draggableBoundary = useMemo(() => {
    return {
      x: screenX,
      y: screenY,
      width: screenWidthPx,
      height: screenHeightPx
    };
  }, [screenX, screenY, screenWidthPx, screenHeightPx]);

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
    
    const box = receptacleBoxes.find(box => box.id === id);
    if (!box) return;
    
    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    setStartDragInfo(id, point, { x: box.x, y: box.y });
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle drag
  const handleDrag = (event) => {
    const point = clientToSVGCoordinates(event.clientX, event.clientY);
    updateBoxPosition(point);
  };

  // End dragging
  const handleMouseUp = () => {
    endDrag();
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleMouseUp);
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

  // Convert dimensions to meters for display (1 inch = 0.0254 meters)
  const widthInMeters = (rawWidth * 0.0254).toFixed(2);
  const heightInMeters = (rawHeight * 0.0254).toFixed(2);

  return (
    <div className="w-full flex justify-center bg-white flex-col text-center p-4 ml-0">
      <div className="mb-0 flex justify-start text-start">
        <svg
          ref={svgRef}
          width="100%"
          height="1100"
          viewBox="0 0 1000 900"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          style={{ touchAction: "none", backgroundColor: "#FFFFFF" }}
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

          {/* Wall outline */}
          <rect
            x={wallX}
            y={wallY}
            width={wallWidthPx}
            height={wallHeightPx}
            fill="#d7d3d3"
            stroke="#888888"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Wall dimensions */}
          <text
            x={centerX}
            y={wallY - 10}
            textAnchor="middle"
            fontSize="14"
            fill="#555555"
          >
            Wall Size: {wallWidth}m × {wallHeight}m
          </text>

          {/* Human figure for scale reference */}
          <image 
            href={humanLogo} 
            x={humanX}
            y={humanY}
            height={humanHeightPx}
            width={humanWidthPx}
            preserveAspectRatio="xMidYMid meet"
          />

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

              {/* Niche measurements */}
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
  x={centerX}
  y={nicheY + nicheHeightPx + 60}
  textAnchor="middle"
  fontSize="12"
>
  {isHorizontal ? (width + 3).toFixed(1) : (height + 3).toFixed(1)}" (Niche Width)
</text>

              <line
                x1={nicheX - 20}
                y1={nicheY}
                x2={nicheX - 20}
                y2={nicheY + nicheHeightPx}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
              <text 
                x={nicheX - 40}
                y={centerY}
                textAnchor="middle"
                fontSize="12"
              >
                {isHorizontal ? (height + 3).toFixed(1) : (width + 3).toFixed(1)}" (Niche Height)
              </text>
              
              {/* Side view - scaled with depth */}
              <text x={sideViewX + sideViewDepth/2} y={sideViewY - 10} textAnchor="middle" fontSize="12">
                Side View
              </text>
              
              <rect
                x={sideViewX}
                y={sideViewY}
                width={sideViewDepth}
                height={sideViewHeight}
                fill="none"
                stroke="black"
                strokeWidth="1"
              />
              
              {/* Side view measurement */}
              <line
                x1={sideViewX}
                y1={sideViewY + sideViewHeight + 20}
                x2={sideViewX + sideViewDepth}
                y2={sideViewY + sideViewHeight + 20}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
              <text 
                x={sideViewX + sideViewDepth/2}
                y={sideViewY + sideViewHeight + 35}
                textAnchor="middle"
                fontSize="12"
              >
                {depth.toFixed(1)}" (Depth)
              </text>
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
                y1={wallY}
                x2={centerX}
                y2={wallY + wallHeightPx}
                stroke="black"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <text x={centerX + 5} y={wallY + 15} textAnchor="start" fontSize="12">
                Centerline
              </text>
            </>
          )}

          {/* Centerline (Horizontal) */}
          {safeVisibility.centreLine && (
            <line
              x1={wallX}
              y1={centerY}
              x2={wallX + wallWidthPx}
              y2={centerY}
              stroke="black"
              strokeWidth="1"
              strokeDasharray="4"
            />
          )}

          {/* Draggable Receptacle Boxes */}
          {safeVisibility.receptacleBox && receptacleBoxes.map((box, index) => (
            <g 
              key={box.id} 
              onMouseDown={(e) => startDrag(e, box.id)}
              style={{ cursor: 'move' }}
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
                x={box.x + (box.width / 2)} 
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
                x2={receptacleBoxes[0].x + 50}
                y2={receptacleBoxes[0].y - 30}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#circle)"
              />
              <text 
                x={receptacleBoxes[0].x + 55}
                y={receptacleBoxes[0].y - 35}
                textAnchor="start"
                fontSize="12"
              >
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
            x1={screenX}
            y1={screenY - 20}
            x2={screenX + screenWidthPx}
            y2={screenY - 20}
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          
          <text
            x={centerX}
            y={screenY - 35}
            textAnchor="middle"
            fontSize="12"
          >
            {isHorizontal ? 
              `${rawWidthValue}" (${widthInMeters}m)` : 
              `${rawHeightValue}" (${heightInMeters}m)`
            } ({widthLabel})
          </text>

          {/* Right side measurement for screen height */}
          <line
            x1={screenX + screenWidthPx + 20}
            y1={screenY}
            x2={screenX + screenWidthPx + 20}
            y2={screenY + screenHeightPx}
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />

          <text 
            x={screenX + screenWidthPx + 40} 
            y={centerY} 
            textAnchor="start" 
            fontSize="12"
          >
            {isHorizontal ? 
              `${rawHeightValue}" (${heightInMeters}m)` : 
              `${rawWidthValue}" (${widthInMeters}m)`
            } ({heightLabel})
          </text>

          {/* Floor Line */}
          <line
            x1={wallX - 20}
            y1={floorLineY}
            x2={wallX + wallWidthPx + 20}
            y2={floorLineY}
            stroke="black"
            strokeWidth="1.5"
          />
          
          {/* Floor Line Measurement */}
          {safeVisibility.floorLine && (
            <>
              <line
                x1={wallX - 40}
                y1={centerY}
                x2={wallX - 40}
                y2={floorLineY}
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
              <text x={wallX - 60} y={floorLineY - 50} textAnchor="middle" fontSize="12">
                Floor to<br/>Centerline:<br/>{floorDistance || "50"}
              </text>
              <text x={wallX - 60} y={floorLineY + 15} textAnchor="middle" fontSize="12">
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
              <circle cx={centerX} cy={centerY} r="5" fill="none" stroke="black" />
              <circle cx={centerX} cy={centerY} r="3" fill="yellow" stroke="black" />
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