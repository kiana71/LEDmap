import React, { useEffect, useRef, useMemo, useState } from "react";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { useVisibility } from "./toggleMenu";
//For dimention
import { findMax } from "../utils/numberUtils";
//
import humanLogo from "../img/outline-human-body-mens-figure-in-linear-style-the-outline-of-a-young-man-black-and-white-silho.png";
import { useToolbar } from "../hook/ToolbarContext";
import DimensionGroup from "./DimensionGroup";
import DimensionItem from "./DimensionItem";
import InfoTable from "./InfoTable";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import DownloadIcon from "@mui/icons-material/Download";

// Calculate raw nicheDepth

// Force to nearest 1/8th inch (0.125)
const roundToNearest8th = (num) => {
  // Get the whole number part
  const wholePart = Math.floor(num);

  // Get the decimal part
  const decimalPart = num - wholePart;

  // The possible 1/8th fractions
  const eighths = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

  // Find the closest 1/8th fraction
  let closestEighth = 0;
  let minDifference = 1;

  for (const eighth of eighths) {
    const difference = Math.abs(decimalPart - eighth);
    if (difference < minDifference) {
      minDifference = difference;
      closestEighth = eighth;
    }
  }

  // If closest is 1, increment whole part and set fraction to 0
  if (closestEighth === 1) {
    return wholePart + 1;
  }

  // Otherwise return whole part plus closest fraction
  return wholePart + closestEighth;
};

// Get the rounded nicheDepth

const Canvas = ({containerRef}) => {
  // Generate a unique component ID for the notes section
  const notesComponentId = "diagram-notes-editor";

  //Note related
  // Use the toolbar hook
  const toolbar = useToolbar(notesComponentId);

  // Enable toolbar for notes section on component mount
  useEffect(() => {
    toolbar.enable();
    // Cleanup will happen automatically when component unmounts
    return () => {
      toolbar.disable();
    };
  }, []);
  // Note done

  // Get visibility state from context with fallback values
  const { visibleElements = {} } = useVisibility();

  // Ensure we have default values if visibleElements is undefined
  const safeVisibility = {
    floorLine: true,
    centreLine: true,
    woodBacking: true,
    receptacleBox: true,
    intendedPosition: true,
    ...visibleElements,
  };

  // Destructure intendedPosition from safeVisibility
  const { intendedPosition } = safeVisibility;

  // Add constants for better maintainability
  const COLORS = {
    primary: "#000000",
    highlight: "#000000",
    accent: "#FFA500",
    background: "#ffffff",
    floorLine: "#3366CC", // Blue color for floor line
    measurement: "#CC3366", // Accent color for measurements
  };

  //SVG ref for coordinate conversion
  const svgRef = useRef(null);

  // Get all state and methods from the store
  const {
    isHorizontal,

    boxCount,
    activeBoxId,
    setStartDragInfo,
    updateBoxPosition,
    endDrag,
    receptacleBoxes,
    isNiche,
    BOX_WIDTH,
    BOX_HEIGHT,
    floorDistance,
    selectedScreen,
    selectedMediaPlayer,
    updateBoundary,
    repositionBoxes,
    selectedMount,
    variantDepth,
    isEdgeToEdge,
    canDownload,
  } = useSheetDataStore();
  //Dimension related
  // Calculate raw nicheDepth
  const rawNicheDepth =
    parseFloat(selectedScreen?.Depth || 0) +
    parseFloat(
      findMax(
        selectedMediaPlayer?.Depth || 0,
        selectedMount ? selectedMount["Depth (in)"] : 0
      )
    ) +
    parseFloat(variantDepth || 0);

  // Force to nearest 1/8th inch (0.125)
  const roundToNearest8th = (num) => {
    // Get the whole number part
    const wholePart = Math.floor(num);

    // Get the decimal part
    const decimalPart = num - wholePart;

    // The possible 1/8th fractions
    const eighths = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

    // Find the closest 1/8th fraction
    let closestEighth = 0;
    let minDifference = 1;

    for (const eighth of eighths) {
      const difference = Math.abs(decimalPart - eighth);
      if (difference < minDifference) {
        minDifference = difference;
        closestEighth = eighth;
      }
    }

    // If closest is 1, increment whole part and set fraction to 0
    if (closestEighth === 1) {
      return wholePart + 1;
    }
    // Otherwise return whole part plus closest fraction
    return wholePart + closestEighth;
  };

  // Get the rounded nicheDepth
  const nicheDepth = roundToNearest8th(rawNicheDepth);
  //Dimension end

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
  const MAX_SCREEN_HEIGHT = 400;

  // Fixed floor line position from the top of the SVG
  const FIXED_FLOOR_LINE_Y = 600; // This will be our fixed floor line position

  // Dynamic scaling factor based on screen size
  const widthScaleFactor = Math.min(10, MAX_SCREEN_WIDTH / Math.max(width, 1));
  const heightScaleFactor = Math.min(10, MAX_SCREEN_HEIGHT / Math.max(height, 1));
  const SCALE_FACTOR = Math.min(widthScaleFactor, heightScaleFactor);

  // Calculate screen dimensions in pixels with adaptive scaling
  const screenWidthPx = Math.max(100, width * SCALE_FACTOR);
  const screenHeightPx = Math.max(100, height * SCALE_FACTOR);

  // Calculate niche dimensions in pixels
  const nicheWidthPx = screenWidthPx + nicheWidthExtra * SCALE_FACTOR;
  const nicheHeightPx = screenHeightPx + nicheHeightExtra * SCALE_FACTOR;

  // Calculate center positions - ensure we have enough margin on all sides
  const centerX = BASE_WIDTH / 2;
  // Adjust centerY to maintain proper distance from floor line
  const centerY = FIXED_FLOOR_LINE_Y - 300; // Position screen relative to fixed floor line

  // Calculate screen position (centered)
  const screenX = centerX - screenWidthPx / 2;
  const screenY = centerY - screenHeightPx / 2;

  // Calculate niche position (centered around screen)
  const nicheX = centerX - nicheWidthPx / 2;
  const nicheY = centerY - nicheHeightPx / 2;

  // Wood backing dimensions (slightly smaller than screen)
  const woodBackingMargin = isEdgeToEdge ? 5 : 30;
  const woodBackingX = screenX + woodBackingMargin;
  const woodBackingY = screenY + woodBackingMargin;
  const woodBackingWidth = screenWidthPx - woodBackingMargin * 2;
  const woodBackingHeight = screenHeightPx - woodBackingMargin * 2;

  // Side view dimensions - scaled with the screen depth but with minimum and maximum
  const sideViewX = screenX + screenWidthPx + 70;
  const sideViewY = screenY;
  const sideViewHeight = screenHeightPx;
  const sideViewDepth = Math.max(25, Math.min(50, depth * SCALE_FACTOR));

  // Use FIXED_FLOOR_LINE_Y instead of calculating floorLineY
  const floorLineY = FIXED_FLOOR_LINE_Y;

  //sideview
  const viewBoxWidth = Math.max(BASE_WIDTH, sideViewX + sideViewDepth + 60);
  
  // Set viewBoxHeight to be larger than FIXED_FLOOR_LINE_Y to ensure floor line is visible
  const viewBoxHeight = Math.max(FIXED_FLOOR_LINE_Y + 100, 700);

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
      const currentViewBox = svgRef.current.getAttribute("viewBox");
      svgRef.current.setAttribute("viewBox", currentViewBox);
    }
  }, [floorDistance, viewBoxHeight]);
  //Convert client coordinates to SVG coordinates
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

  // Zoom Buttons -----------------------------------------
  const [scale, setScale] = useState(1);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);
  // Zoom Buttons -----------------------------------------

  //pdf--------------------------====================
//   const containerRef = useRef(null);

//   const exportToPDF = async () => {
//     const bc = document.getElementById("bottom_container");
//     toggleClassOnTableInputs("table_input","bottom-3", true)
//     toggleClassOnTableInputs("table_input_td","pb-3", true)
// toggleClassOnTableInputs("p_print", "pb-3" , true)
//     bc.classList.remove("h-40");
//     bc.classList.add("h-64");
//     bc.classList.remove("mb-1");
//     bc.classList.add("mb-3");
//     containerRef.current.classList.add("pb-8");

//     if (!containerRef.current) return;

//     // Configure for high quality
//     const scale = 4; // Higher scale = better quality

//     const canvas = await html2canvas(containerRef.current, {
//       scale: scale,
//       useCORS: true,
//       logging: false,
//       backgroundColor: "#f3f4f6", // Match your bg-gray-200
//     });

//     const imgData = canvas.toDataURL("image/jpeg", 1.0);

//     // Create PDF with custom dimensions to match your element's aspect ratio
//     // Convert pixels to mm (assuming 96 DPI)
//     const pxToMm = 0.264583333;
//     const widthMm = 3300 * pxToMm;
//     const heightMm = 2550 * pxToMm;

//     const pdf = new jsPDF({
//       orientation: widthMm > heightMm ? "landscape" : "portrait",
//       unit: "mm",
//       format: [widthMm, heightMm],
//       compress: true, // Optional: reduces file size
//       precision: 4 
//     });
// // Optional: Set PDF print quality
//     pdf.setProperties({
//       title: 'High Resolution Print',
//       creator: 'Your Application Name',
//       printQuality: 300 // Explicitly set print quality
//     });
//     // Add image to perfectly fit the page
//     pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm, "", "FAST");

//     pdf.save("container-export.pdf");
//     toggleClassOnTableInputs("table_input","bottom-3", false)
//     toggleClassOnTableInputs("table_input_td","pb-3", false)
//     toggleClassOnTableInputs("p_print", "pb-3" , false)
//     bc.classList.remove("h-64");
//     bc.classList.add("h-40");
//     bc.classList.remove("mb-3")
//     containerRef.current.classList.remove("pb-8");
//   };
  //pdf--------------------------====================

  const showSections = canDownload();

  return (
    <>
      {/* <div
        onClick={exportToPDF}
        className="h-16 fixed right-0 bottom-0 justify-center items-center flex-row no-wrap px-4 w-80 hidden lg:flex z-40"
      >
        <button className="h-9 m-auto px-1 text-white bg-blue-700 font-semibold border-2 border-transparent hover:border-orange-600 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out w-full flex items-center justify-between rounded">
          <div className="h-full flex justify-center flex-1 items-center">
            <span>Download</span>
          </div>
          <div className="bg-blue-700 text-white flex h-full items-center">
            <DownloadIcon />
          </div>
        </button>
      </div> */}
      {/* Zoom Buttons */}
      <div className="fixed top-16 left-5 z-10 bg-white p-2 rounded shadow">
        <button onClick={zoomIn} className="px-3 py-1 bg-gray-200 rounded">
          +
        </button>
        <button onClick={resetZoom} className="px-3 py-1 bg-gray-200 rounded mx-2">
          Reset
        </button>
        <button onClick={zoomOut} className="px-3 py-1 bg-gray-200 rounded">
          -
        </button>
      </div>
      <div className="overflow-auto w-full h-screen pt-14 lg:pr-80 pr-0 top-0 bg-gray-200 relative">
        {/* Main Drawing Container */}
        <div
          ref={containerRef}
          className="w-[1056px] border h-[816px] p-4 flex flex-col justify-between gap-4 bg-white print:w-[816px] print:h-[1056px] print:m-0 print:p-0"
          style={{
            transform: `translate(calc(-50% - 120px), -50%) scale(${scale})`,
            position: "absolute",
            top: "52%",
            left: "50%",
          }}
        >
          {showSections ? (
            <>
              {/* Upper Section */}
              <div className="flex-1 flex flex-row justify-between print:p-2">
                <div className="flex justify-center flex-1 items-center">
                  {/* Main Content Area 111111111111111111111111 */}
                  <div className="flex justify-end relative bg-opacity-30 max-w-[1200px] max-h-[1200px] h-full">
                    {/* LED Video Wall Intended Position */}

                    <svg
                      ref={svgRef}
                      width="100%"
                      height="115%"
                      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ touchAction: "none" }}
                    >
                      <title>LED Display Installation Diagram</title>
                      <desc>
                        Technical diagram showing LED display mounting
                        specifications and measurements
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
                      <rect
                        width="100%"
                        height="100%"
                        fill="url(#grid)"
                        opacity="0.1"
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
                            y1={nicheY + nicheHeightPx + 6}
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
                            x2={sideViewX - 20}
                            y2={nicheY}
                            stroke="black"
                            strokeWidth=".5"
                          />
                          <line
                            x1={nicheX + nicheWidthPx}
                            y1={nicheY + nicheHeightPx}
                            x2={sideViewX - 20}
                            y2={nicheY + nicheHeightPx}
                            stroke="black"
                            strokeWidth=".5"
                          />

                          {/* Height label on right side */}
                          <text
                            x={sideViewX - 37}
                            y={centerY}
                            textAnchor="middle"
                            fontSize="12"
                            transform="rotate(270, sideViewX - 35, centerY)"
                          >
                            {DirnicheHeight.toFixed(1)}
                            <tspan x={sideViewX - 37} dy="14">
                              (Niche)
                            </tspan>
                          </text>
                        </>
                      )}

                      {/* Side view - always visible */}
                      {/* Gray background for side view */}
                      <rect
                        x={sideViewX}
                        y={sideViewY}
                        width={sideViewDepth + 6}
                        height={sideViewHeight}
                        fill="#CCCCCC"
                        stroke="none"
                        opacity="1"
                      />
                      <text
                        x={sideViewX + sideViewDepth / 2}
                        y={sideViewY + sideViewHeight + 63}
                        textAnchor="middle"
                        fontSize="12"
                      >
                        (Side View){nicheDepth.toFixed(2)}
                      </text>
                      {nicheDepth.toFixed(3)}
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
                        x1={sideViewX - 15}
                        y1={sideViewY + 2}
                        x2={sideViewX - 15}
                        y2={sideViewY + sideViewHeight - 2}
                        stroke="black"
                        strokeWidth="1"
                        markerStart="url(#arrowReversed)"
                        markerEnd="url(#arrow)"
                      />

                      {/* Side view dimension lines - always visible */}
                      <line
                        x1={sideViewX}
                        y1={sideViewY + sideViewHeight + 5}
                        x2={sideViewX}
                        y2={sideViewY + sideViewHeight + 40}
                        stroke="black"
                        strokeWidth=".5"
                      />
                      <line
                        x1={sideViewX + sideViewDepth + 7}
                        y1={sideViewY + sideViewHeight + 5}
                        x2={sideViewX + sideViewDepth + 7}
                        y2={sideViewY + sideViewHeight + 40}
                        stroke="black"
                        strokeWidth=".5"
                      />
                      <line
                        x1={sideViewX + 2}
                        y1={sideViewY + sideViewHeight + 40}
                        x2={sideViewX + sideViewDepth + 4}
                        y2={sideViewY + sideViewHeight + 40}
                        stroke="black"
                        strokeWidth="1"
                        markerStart="url(#arrowReversed)"
                        markerEnd="url(#arrow)"
                      />

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
                            y1={screenY - 40}
                            x2={centerX}
                            y2={screenY + screenHeightPx + 40}
                            stroke="black"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                          />

                          {/* Horizontal centerline - constrained to screen */}
                          <line
                            x1={screenX - 40}
                            y1={centerY}
                            x2={screenX + screenWidthPx + 40}
                            y2={centerY}
                            stroke="black"
                            strokeWidth="1"
                            strokeDasharray="4"
                          />
                          
                          {/* Center point circle at intersection of centerlines */}
                        

                          {/* Label line */}
                       
                         
                        </>
                      )}
  {intendedPosition && (
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
                        receptacleBoxes.map((box, index) => {
                          // Ensure all values are valid numbers
                          const boxX = parseFloat(box.x) || 0;
                          const boxY = parseFloat(box.y) || 0;
                          const boxWidth = parseFloat(box.width) || 0;
                          const boxHeight = parseFloat(box.height) || 0;
                          
                          // Calculate text position
                          const textX = boxX + (boxWidth / 2);
                          const textY = Math.max(0, boxY - 5);
                          
                          return (
                            <g key={box.id}>
                              <rect
                                x={boxX}
                                y={boxY}
                                width={boxWidth}
                                height={boxHeight}
                                fill={COLORS.background}
                                stroke={COLORS.highlight}
                                strokeWidth="1.5"
                              />
                              <text
                                x={textX}
                                y={textY}
                                textAnchor="middle"
                                fontSize="10"
                                fill={COLORS.highlight}
                              >
                                Box {index + 1}
                              </text>
                            </g>
                          );
                        })}

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

                      {!isNiche && (
                        <>
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
                            x={screenX - 87}
                            y={centerY}
                            textAnchor="middle"
                            fontSize="12"
                            transform="rotate(270, screenX - 75, centerY)"
                          >
                            {isHorizontal ? rawHeightValue : rawWidthValue}
                            <tspan x={screenX - 87} dy="14">
                              (Height)
                            </tspan>
                          </text>
                        </>
                      )}
                     

                      {/* Floor Line */}
                      <line
                        x1="90"
                        y1={FIXED_FLOOR_LINE_Y}
                        x2="700"
                        y2={FIXED_FLOOR_LINE_Y}
                        stroke={COLORS.floorLine}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      {/* Floor Line Measurement */}
                      {safeVisibility.floorLine && (
                        <>
                          {/* Top portion of line */}
                          <line
                            x1="90"
                            y1={centerY + 7}
                            x2="90"
                            y2={FIXED_FLOOR_LINE_Y - 3}
                            stroke={COLORS.measurement}
                            strokeWidth="1.5"
                            markerStart="url(#arrowReversed)"
                            markerEnd="url(#arrow)"
                          />

                          {/* Floor line label */}
                          <text
                            x="40"
                            y={FIXED_FLOOR_LINE_Y - 5}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="bold"
                            fill={COLORS.floorLine}
                          >
                            Floor Line
                          </text>

                          {/* Distance measurement */}
                          <text
                            x="69"
                            y={(centerY + FIXED_FLOOR_LINE_Y) / 2}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill={COLORS.measurement}
                          >
                            {floorDistance}
                          </text>

                          {/* Visual indicator markers */}
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
                            cy={FIXED_FLOOR_LINE_Y}
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
                    {/* Center line */}
                  </div>
                </div>
                {/* Dimension Boxes Area 22222222222222222222222*/}
                {/* if (rawNicheDepth) //////////////////////////////////////////*/}
                {rawNicheDepth && selectedScreen ? (
                  <div className=" m-0 w-1/6 p-1 max-w-72">
                    <div className="w-full flex flex-col space-y-4 ">
                      <div className="border border-black p-2 bg-white bg-opacity-30 w-full ">
                        <div className="font-bold text-sm">
                          <DimensionGroup
                            title="Screen Dimensions"
                            className="w-full"
                          >
                            <DimensionItem
                              label="Height"
                              value={selectedScreen["Height"] || 0}
                              className="flex flex-row items-center justify-between  border-black"
                            />
                            <DimensionItem
                              label="Width"
                              value={selectedScreen["Width"] || 0}
                              className="flex flex-row items-center justify-between  border-black "
                            />
                            <DimensionItem
                              label="Depth"
                              value={selectedScreen["Depth"] || 0}
                              className="flex flex-row items-center justify-between  border-black"
                            />
                          </DimensionGroup>
                        </div>
                      </div>

                      {/* Niche Dimensions Box */}
                      {isNiche && (
                        <div className="border border-black p-1 bg-white bg-opacity-30 w-full ">
                          <div className="font-bold text-sm">
                            <DimensionGroup
                              title="Niche Dimensions"
                              className="w-full"
                            >
                              <DimensionItem
                                label="Height"
                                value={
                                  selectedScreen?.["Screen Size"]
                                    ? (
                                        parseFloat(selectedScreen["Height"]) +
                                        (selectedScreen["Height"] < 55 ? 1.5 : 2)
                                      ).toFixed(2)
                                    : 0
                                }
                                className="items-center text-center justify-between border-black h-8"
                              />
                              <DimensionItem
                                label="Width"
                                value={
                                  selectedScreen?.["Screen Size"]
                                    ? (
                                        parseFloat(selectedScreen["Width"]) +
                                        (selectedScreen["Height"] < 55 ? 1.5 : 2)
                                      ).toFixed(2)
                                    : 0
                                }
                                className="flex flex-row items-center justify-between  border-black h-8"
                              />
                              <DimensionItem
                                label="Depth"
                                value={nicheDepth.toFixed(3)}
                                className="flex flex-row items-center justify-between border-black h-8"
                              />
                            </DimensionGroup>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            // Show this when no valid selections are made
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-2xl font-semibold mb-4">Welcome to LED Technical Map</p>
                <p className="text-lg">Please select both a Screen and Mount option to view the layout</p>
              </div>
            </div>
          )}

          {/* Bottom Row - Notes and Table -----------------------------------------------------*/}
          <div
            className="flex space-x-6 h-40 print:h-44 print:mx-2 print:mb-2"
            id="bottom_container"
          >
            {/* Notes Section 33333333333333333333333*/}
            <div className="flex-1 border border-gray-400 bg-opacity-30 p-2">
            <div className="h-[140px] p-4  flex-col relative mb-3">
  <p className="absolute left-3 top-3 text-md font-light underline mb-2">NOTES:</p>
  <div
    className="absolute top-10 left-3 right-3 bottom-3 overflow-auto notes-editor"
    contentEditable="true"
    style={{ 
      outline: "none", 
      maxHeight: "100%", 
      overflowY: "auto",
      wordWrap: "break-word",
      wordBreak: "break-word"
    }}
    data-toolbar-enabled={notesComponentId}
  >
  </div>
</div>
            </div>
            <div className="flex-1 bg-opacity-30">
              <InfoTable/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Canvas;


// /**
//  * Toggles a specific class on all elements with the className "table_input"
//  * @param {string} className - The class to add or remove
//  * @param {boolean} shouldAdd - True to add the class, false to remove it
//  */
// function toggleClassOnTableInputs(targetClass, className, shouldAdd) {
//   // Get all elements with the className "table_input"
//   const tableInputs = document.querySelectorAll('.'+targetClass);
  
//   // Loop through each element
//   tableInputs.forEach(element => {
//     if (shouldAdd) {
//       // Add the class if it doesn't exist
//       element.classList.add(className);
//     } else {
//       // Remove the class if it exists
//       element.classList.remove(className);
//     }
//   });
// }
