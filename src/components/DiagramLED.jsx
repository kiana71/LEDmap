import React, { useRef, useEffect, useMemo } from "react";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { useVisibility } from './toggleMenu';

const DiagramLED = () => {
  // Get visibility state from context with fallback values
  const { visibleElements = {} } = useVisibility();
  
  // Ensure we have default values if visibleElements is undefined
  const safeVisibility = {
    floorLine: true,
    centreLine: true,
    woodBacking: true,
    receptacleBox: true,
    ...visibleElements
  };

  // Add constants for better maintainability
  const COLORS = {
    primary: "#000000",
    highlight: "#000000",
    accent: "#FFA500",
    background: "#ffffff",
  };
  
  // SVG ref for coordinate conversion
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
    floorDistance
  } = useSheetDataStore();
  
  // Get dimensions from selected screen and parse as numbers
  const width = parseFloat(selectedScreen?.["Width"] || 0);
  const height = parseFloat(selectedScreen?.["Height"] || 0);
  const depth = parseFloat(selectedScreen?.["Depth"] || 0);

  // Calculate niche dimensions with proper margins
  const nicheWidthExtra = width < 55 ? 3 : 4; // Add 1.5 or 2 inches on each side
  const nicheHeightExtra = height < 55 ? 3 : 4; // Add 1.5 or 2 inches on each side
  const nicheWidth = width + nicheWidthExtra;
  const nicheHeight = height + nicheHeightExtra;

  // Define conversion factor from inches to pixels
  const SCALE_FACTOR = 10; // 10 pixels per inch

  // Base dimensions for the diagram area
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 800;
  
  // Calculate screen dimensions in pixels
  const screenWidthPx = Math.max(100, Math.min(500, width * SCALE_FACTOR));
  const screenHeightPx = Math.max(100, Math.min(300, height * SCALE_FACTOR));
  
  // Calculate niche dimensions in pixels
  const nicheWidthPx = screenWidthPx + (nicheWidthExtra * SCALE_FACTOR);
  const nicheHeightPx = screenHeightPx + (nicheHeightExtra * SCALE_FACTOR);
  
  // Calculate center positions
  const centerX = 400; // Center of the diagram
  const centerY = 300; // Center position for the screen
  
  // Calculate screen position (centered)
  const screenX = centerX - (screenWidthPx / 2);
  const screenY = centerY - (screenHeightPx / 2);
  
  // Calculate niche position (centered around screen)
  const nicheX = centerX - (nicheWidthPx / 2);
  const nicheY = centerY - (nicheHeightPx / 2);
  
  // Wood backing dimensions (slightly smaller than screen)
  const woodBackingMargin = 30;
  const woodBackingX = screenX + woodBackingMargin;
  const woodBackingY = screenY + woodBackingMargin;
  const woodBackingWidth = screenWidthPx - (woodBackingMargin * 2);
  const woodBackingHeight = screenHeightPx - (woodBackingMargin * 2);

  // Side view dimensions - scaled with the screen depth
  const sideViewX = 810;
  const sideViewY = screenY - 14;
  const sideViewHeight = nicheHeightPx;
  const sideViewDepth = Math.max(25, Math.min(50, depth * SCALE_FACTOR));

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

  // Update dragging boundary based on screen dimensions
  // Define a boundary for the receptacle boxes based on the screen
  const draggableBoundary = useMemo(() => {
    return {
      x: screenX - 10,
      y: screenY - 10,
      width: screenWidthPx + 20,
      height: screenHeightPx + 20
    };
  }, [screenX, screenY, screenWidthPx, screenHeightPx]);

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

  return (
    <div className="w-full flex justify-center bg-white flex-col text-center p-4 ml-0">
      <div className="mb-0 flex justify-start text-start">
        <svg
          ref={svgRef}
          width="100%"
          height="1100"
          viewBox="0 0 800 800"
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
              <rect
                x="50"
                y="268"
                width="40"
                height="20"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />
              <text x="70" y="280" textAnchor="middle" fontSize="12">
                {nicheWidth.toFixed(1)}
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
              
              <rect
                x="350"
                y={nicheY + nicheHeightPx + 58}
                width="40"
                height="20"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />
              <text x="370" y={nicheY + nicheHeightPx + 70} textAnchor="middle" fontSize="12">
                {nicheHeight.toFixed(1)}
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
              <text x="795" y="648" textAnchor="start" fontSize="12">
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
          
          <rect
            x={centerX - 20}
            y={screenY - 72}
            width="40"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <text
            x={centerX}
            y={screenY - 60}
            textAnchor="middle"
            fontSize="12"
          >
            {width.toFixed(1)}
          </text>

          {/* Floor Distance label */}
          <rect
            x="31"
            y="315"
            width="40"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <text x="50" y="330" textAnchor="middle" fontSize="12">
            {floorDistance || "50"}
          </text>
          <text x="50" y="340" textAnchor="middle" fontSize="12">
            <tspan x="50" y="355">
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

          <rect
            x={screenX + screenWidthPx + 50}
            y={centerY - 10}
            width="40"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <text 
            x={screenX + screenWidthPx + 70} 
            y={centerY} 
            textAnchor="middle" 
            fontSize="12"
          >
            {height.toFixed(1)}
          </text>

          {/* Floor Line */}
          <line
            x1="90"
            y1="643"
            x2="700"
            y2="643"
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
                y2="640"
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />
              <text x="30" y="620" textAnchor="middle" fontSize="12">
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