import React, { useRef, useEffect, useMemo } from "react";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { useVisibility } from "./toggleMenu";
import humanLogo from "../img/outline-human-body-mens-figure-in-linear-style-the-outline-of-a-young-man-black-and-white-silho.png";
import { useToolbar } from "../hook/ToolbarContext";

const DiagramLED = () => {
  // Generate a unique component ID for the notes section
  const notesComponentId = "diagram-notes-editor";
  
  // Use the toolbar hook
  const toolbar = useToolbar(notesComponentId);
  
  // Enable toolbar for notes section on component mount
  useEffect(() => {
    toolbar.enable();
    // Cleanup will happen automatically when component unmounts
    return () => {
      toolbar.disable();
    };
  }, [toolbar]);
  
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
    floorLine: "#3366CC",  // Blue color for floor line
    measurement: "#CC3366", // Accent color for measurements
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
  const sideViewX = screenX + screenWidthPx + 50; // Position closer to the right edge of screen
  const sideViewY = screenY -7 ;
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

  const MIN_FLOOR_DISTANCE = 5; // Minimum distance in inches
  const calculatedFloorDistance = Math.max(MIN_FLOOR_DISTANCE, floorDistance);
  // Set a static position for the floor line - a bit lower than the LED
  const floorLineY = screenY + screenHeightPx + 80; // 100px below the bottom of the LED
  
  //sideview
  const viewBoxWidth = Math.max(
    BASE_WIDTH, 
    sideViewX + sideViewDepth + 60
  ); // Ensure we have space for the side view
  
  // Calculate dynamic viewBoxHeight based on floor distance with extra padding
  // This ensures the diagram always fits within the viewport as floorDistance changes
  const FLOOR_PADDING = 0; // Extra padding below floor line
  const viewBoxHeight = Math.max(
    600, 
    screenY + screenHeightPx + 200,
    floorLineY + FLOOR_PADDING
  );

  // Effect to update the boundary in the store when screen dimensions change
  useEffect(() => {
    // Update the boundary in the store
    updateBoundary(draggableBoundary);

    // Reposition any boxes that are now outside the boundary
    repositionBoxes();
  }, [draggableBoundary, updateBoundary, repositionBoxes]);
  
  // Effect to adjust SVG viewBox when floor distance changes
  // This ensures the diagram properly scales when the floor line moves
  useEffect(() => {
    if (svgRef.current) {
      // Force SVG to update its viewBox when floorDistance changes
      const currentViewBox = svgRef.current.getAttribute('viewBox');
      svgRef.current.setAttribute('viewBox', currentViewBox);
    }
  }, [floorDistance, viewBoxHeight]);

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
  
  // Calculate the position for the human figure
  const humanX = centerX - 50; // Center the human figure horizontally
  const humanY = floorLineY - 340; // Position relative to floor line
  const humanWidth = 800;
  const humanHeight = 320;

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Fixed-height SVG container */}
      <div className="flex-grow h-[calc(100%-200px)] overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          style={{ touchAction: "none" }}
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
          {/* <image 
            href={humanLogo} 
            x={humanX}
            y={humanY}
            height={humanHeight}
            width={humanWidth}
            preserveAspectRatio="xMidYMid meet"
          /> */}

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

              {/* Left measurement for niche - COMPLETELY REMOVED */}

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
                y1={(nicheY) + nicheHeightPx + 6}
                x2={nicheX}
                y2={nicheY + nicheHeightPx + 40}
                stroke="black"
                strokeWidth=".5"
              />
              <line
                x1={nicheX + nicheWidthPx}
                y1={nicheY + nicheHeightPx + 5}
                x2={nicheX + nicheWidthPx}
                y2={nicheY + nicheHeightPx + 40}
                stroke="black"
                strokeWidth=".5"
              />

              <text
                x="370"
                y={nicheY + nicheHeightPx + 70}
                textAnchor="middle"
                fontSize="12"
              >
                {DirnicheWidth.toFixed(1)}
              </text>

              {/* RIGHT measurement for niche height (NEW POSITION) */}
             
              <line
                x1={nicheX + nicheWidthPx}
                y1={nicheY}
                x2={sideViewX - 15}
                y2={nicheY}
                stroke="black"
                strokeWidth=".5"
              />
              <line
                x1={nicheX + nicheWidthPx}
                y1={nicheY + nicheHeightPx}
                x2={sideViewX - 15}
                y2={nicheY + nicheHeightPx}
                stroke="black"
                strokeWidth=".5"
              />
              
              {/* Height label on right side */}
              <text 
                x={sideViewX + 80} 
                y={centerY}
                textAnchor="middle" 
                fontSize="12"
                transform="rotate(270, sideViewX - 35, centerY)"
              
              >
                {DirnicheHeight.toFixed(1)} (Niche)
              </text>

              {/* Side view - scaled with depth */}
              <text x={sideViewX + (sideViewDepth / 2)} y={sideViewY + sideViewHeight + 30} textAnchor="middle" fontSize="12">
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

          {/* Centerlines - only within screen boundaries */}
          {safeVisibility.centreLine && (
            <>
              {/* Vertical centerline - constrained to screen */}
              <line
                x1={centerX}
                y1={screenY}
                x2={centerX}
                y2={screenY + screenHeightPx}
                stroke="black"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              
              {/* Horizontal centerline - constrained to screen */}
              <line
                x1={screenX}
                y1={centerY}
                x2={screenX + screenWidthPx}
                y2={centerY}
                stroke="black"
                strokeWidth="1"
                strokeDasharray="4"
              />
              
              {/* Center point circle at intersection of centerlines */}
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
              
              {/* Label line */}
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

          {/* Receptacle Boxes - NOT draggable */}
          {safeVisibility.receptacleBox &&
            receptacleBoxes.map((box, index) => (
              <g key={box.id}>
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
            ))
          }

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
            y2={screenY - 12}
            stroke="black"
            strokeWidth=".5"
          />
          <line
            x1={screenX + screenWidthPx}
            y1={screenY - 40}
            x2={screenX + screenWidthPx}
            y2={screenY - 12}
            stroke="black"
            strokeWidth=".5"
          />
                  
          <text
            x={centerX - 50}
            y={screenY - 60}
            textAnchor="middle"
            fontSize="12"
          >
            {isHorizontal ? rawWidthValue : rawHeightValue} (Width)
          </text>

          {/* LEFT side measurement for screen height (moved from right) */}
          <line
            x1={screenX - 40}
            y1={screenY + 6}
            x2={screenX - 40}
            y2={screenY + screenHeightPx - 6}
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          <line
            x1={screenX - 40}
            y1={screenY}
            x2={screenX - 12}
            y2={screenY}
            stroke="black"
            strokeWidth=".5"
          />
          <line
            x1={screenX - 40}
            y1={screenY + screenHeightPx}
            x2={screenX - 12}
            y2={screenY + screenHeightPx}
            stroke="black"
            strokeWidth=".5"
          />

          <text
            x={screenX - 75}
            y={centerY}
            textAnchor="middle"
            fontSize="12"
            transform="rotate(270, screenX - 75, centerY)"
          >
            {isHorizontal ? rawHeightValue : rawWidthValue} (Height)
          </text>

          {/* Floor Line */}
          <line
            x1="90"
            y1={floorLineY}
            x2="700"
            y2={floorLineY}
            stroke={COLORS.floorLine}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Floor Line Measurement */}
          {safeVisibility.floorLine && (
            <>
              {/* Measurement line with zigzag break - proper scaling for small screens */}
              {/* Top portion of line */}
              <line
                x1="90"
                y1={centerY +7}
                x2="90"
                y2={centerY + 50}
                stroke={COLORS.measurement}
                strokeWidth="1.5"
                markerStart="url(#arrowReversed)"
              />

              {/* Zigzag break in the middle - with dynamic spacing based on total distance */}
              <polyline 
                points={`90,${centerY + 50} 
                        80,${centerY + 60} 
                        100,${centerY + 70} 
                        80,${centerY + 80} 
                        100,${centerY + 90} 
                        `} 
                stroke={COLORS.measurement} 
                fill="transparent" 
                strokeWidth="1.5" 
              />

              {/* Bottom portion of line - connect directly to floor line */}
              <line
                x1="90"
                y1={centerY + 100}
                x2="90"
                y2={floorLineY - 3}
                stroke={COLORS.measurement}
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />

              {/* Break symbol text - rotated 90 degrees */}
              <text 
                x="-8" 
                y={centerY + 142} 
                fontSize="8"
                fill={COLORS.measurement}
                transform={`rotate(90, 105, ${centerY + 130})`}
              >
                Not to scale
              </text>

              {/* Distance measurement */}
              <g>
                {/* Measurement text */}
                <text 
                  x="69" 
                  y={(centerY + floorLineY) / 2 + 5} 
                  textAnchor="middle" 
                  fontSize="10"
                  fontWeight="bold"
                  fill={COLORS.measurement}
                >
                  {floorDistance}
                </text>
              </g>
              
              {/* Floor line label */}
              <text 
                x="40" 
                y={floorLineY } 
                textAnchor="middle" 
                fontSize="12"
                fontWeight="bold"
                fill={COLORS.floorLine}
              >
                Floor Line
              </text>
              
              {/* Visual indicator markers with animations */}
              <circle 
                cx="90" 
                cy={centerY} 
                r="4" 
                fill={COLORS.measurement}
              >
                <animate 
                  attributeName="r" 
                  values="3;5;3" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle 
                cx="90" 
                cy={floorLineY} 
                r="4" 
                fill={COLORS.measurement}
              >
                <animate 
                  attributeName="r" 
                  values="3;5;3" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </circle>
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
        </svg>
      </div>

      {/* Fixed-height Notes section */}
      <div className=" h-[250px] border-2 border-gray-400 p-4">
        <p className="mb-1 text-xl font-bold">Notes:</p>
        <div 
          className="border-0 w-full h-[calc(100%-30px)] overflow-auto"
          contentEditable="true"
          style={{ outline: "none" }}
          data-toolbar-enabled={notesComponentId} // This is the key attribute for toolbar targeting
        >
        </div>
      </div>
    </div>
  );
};

export default DiagramLED;