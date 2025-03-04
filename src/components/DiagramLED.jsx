import React from "react";
import Demension from "./Dimension";
import { useSheetDataStore } from "../zustand/sheetDataStore";
const DiagramLED = () => {
  // Add constants for better maintainability
  const COLORS = {
    primary: "#000000",
    highlight: "#FF0000",
    accent: "#FFA500",
    background: "#FFFFFF",
  };
  //niche lines should be hidden
  const {
    isHorizontal,
    isNiche,
    toggleIsHorizontal,
    toggleIsNiche,
    selectedReceptacleBox,
    selectedMediaPlayer,
    selectedMount,
    selectedScreen,
    variantDepth,
  } = useSheetDataStore((state) => state);
  const width = selectedScreen?.["Width"] || 0;
  const height = selectedScreen?.["Height"] || 0;

  return (
    <div className="w-full flex justify-center bg-white flex-col text-center p-4 ml-0ß">
      <div className="mb-0">
        <svg
          width="100%"
          height="700"
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Add a title and description for accessibility */}
          <title>LED Display Installation Diagram</title>
          <desc>
            Technical diagram showing LED display mounting specifications and
            measurements
          </desc>

          {/* Add a subtle grid for better visual reference */}
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

          {/* Outer Rectangle */}
          {isNiche && (
            <>
              <rect
                x="140"
                y="140"
                width="520"
                height="320"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />

              {/* 51" at bottom */}
              <line
                x1="146"
                y1="500"
                x2="654"
                y2="500"
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />

              <line
                x1="140"
                y1="500"
                x2="140"
                y2="460"
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
              <line
                x1="660"
                y1="500"
                x2="660"
                y2="460"
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
              <rect
                x="350"
                y="518"
                width="40"
                height="20"
                fill="none"
                stroke="black"
                strokeWidth="1"
              />
              <text x="370" y="530" textAnchor="middle" fontSize="12">
                {parseFloat(height) + (height < 55 ? 1.5 : 2)}
              </text>

              {/* 30.5" on left */}
              <line
                x1="100"
                y1="143"
                x2="100"
                y2="455"
                stroke="black"
                strokeWidth="1"
                markerStart="url(#arrowReversed)"
                markerEnd="url(#arrow)"
              />

              <line
                x1="100"
                y1="139"
                x2="140"
                y2="139"
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
              <line
                x1="100"
                y1="460"
                x2="140"
                y2="460"
                stroke="black"
                strokeWidth=".5"
                strokeDasharray="2"
              />
            </>
          )}
          <rect
            x="150"
            y="150"
            width="500"
            height="300"
            fill="none"
            stroke="black"
            strokeWidth="2"
          />

          {/* Inner Rectangle (Dashed) - Thicker border */}
          <rect
            x="200"
            y="180"
            width="400"
            height="240"
            fill="none"
            stroke="black"
            strokeDasharray="8,8"
            strokeWidth="1"
          />

          {/* Centerline (Vertical) */}
          <line
            x1="400"
            y1="50"
            x2="400"
            y2="590"
            stroke="black"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Centerline (Horizontal) */}
          <line
            x1="50"
            y1="300"
            x2="760"
            y2="300"
            stroke="black"
            strokeWidth="1"
            strokeDasharray="4"
          />

          {/* Receptacle Box (Dashed) */}
          {/* Receptacle Box - Render only if a valid option is selected */}
          {selectedReceptacleBox?.Brand && (
            <>
              <rect
                x="385"
                y="370"
                width="30"
                height="30"
                fill={COLORS.background}
                stroke={COLORS.highlight}
                strokeDasharray="3,3"
                strokeWidth="1.5"
              />
              <rect
                x="380"
                y="365"
                width="40"
                height="40"
                fill="none"
                stroke={COLORS.highlight}
                strokeDasharray="3,3"
                strokeWidth="1.5"
              />
              <line
                x1="410"
                y1="380"
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
          {/* side view*/}

          <text x="795" y="648" textAnchor="start" fontSize="12">
                Side View
              </text>
          
          <line
            x1="810"
            y1="156"
            x2="810"
            y2="445"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="830"
            y1="156"
            x2="830"
            y2="445"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="836"
            y1="156"
            x2="836"
            y2="445"
            stroke="black"
            strokeWidth="1"
          />
          {/*top and bottom lines*/}
          <line
            x1="810"
            y1="156"
            x2="830"
            y2="156"
            stroke="black"
            strokeWidth="1"
          />

          <line
            x1="810"
            y1="445"
            x2="830"
            y2="445"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="830"
            y1="445"
            x2="835"
            y2="445"
            stroke="black"
            strokeWidth="1"
          />
          <line
            x1="830"
            y1="156"
            x2="835"
            y2="156"
            stroke="black"
         
          />
{/*Masurment lines*/}

<line
            x1="800"
            y1="158"
            x2="800"
            y2="445"
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
<line
            x1="810"
            y1="460"
            x2="835"
            y2="460"
            stroke="black"
            strokeWidth="1"
             markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />

<line
            x1="810"
            y1="156"
            x2="800"
            y2="156"
            stroke="black"
            strokeWidth="1"
           strokeDasharray="2"
          />
          <line
            x1="810"
            y1="445"
            x2="800"
            y2="445"
            stroke="black"
            strokeWidth="1"
           strokeDasharray="2"
          />
           <line
            x1="810"
            y1="447"
            x2="810"
            y2="457"
            stroke="black"
            strokeWidth="1"
           strokeDasharray="2"
          />
           <line
            x1="835"
            y1="447"
            x2="835"
            y2="457"
            stroke="black"
            strokeWidth="1"
           strokeDasharray="2"
          />
{/* Start from here */}
          {/* Diagonal Lines */}
          <line
            x1="400"
            y1="300"
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

          {/* measuremets */}
          {/* 48.5" at top */}
          <line
            x1="156"
            y1="110"
            x2="645"
            y2="110"
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          <line
            x1="150"
            y1="400"
            x2="150"
            y2="110"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          <line
            x1="650"
            y1="148"
            x2="650"
            y2="110"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          <rect
            x="350"
            y="78"
            width="40"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <text
            x="370"
            y="90"
            textAnchor="middle"
            fontSize="12"
            className="measurement-text"
          >
            {width}
          </text>

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
            {parseFloat(width) + (width < 55 ? 1.5 : 2)}
          </text>

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
            50"
          </text>
          <text x="50" y="340" textAnchor="middle" fontSize="12">
            <tspan x="50" y="355">
              Centerline of
            </tspan>
            <tspan x="50" dy="12">
              display
            </tspan>
          </text>
          {/* 28" on right */}
          <line
            x1="700"
            y1="156"
            x2="700"
            y2="445"
            stroke="black"
            strokeWidth="1"
            markerStart="url(#arrowReversed)"
            markerEnd="url(#arrow)"
          />
          <line
            x1="653"
            y1="150"
            x2="698"
            y2="150"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />
          <line
            x1="653"
            y1="450"
            x2="698"
            y2="450"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray="2"
          />

          <rect
            x="710"
            y="268"
            width="40"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <text x="730" y="280" textAnchor="middle" fontSize="12">
            {height}
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

          <line
            x1="90"
            y1="307"
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

          {/* Arrow Definitions */}
          <defs>
            {/* Normal Arrow */}
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
            {/* Reversed Arrow */}
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

          {/* Circle at Intersection of Centerlines */}
          <circle cx="400" cy="300" r="5" fill="" stroke="black" />
          <circle cx="400" cy="300" r="3" fill="yellow" stroke="black" />
        </svg>
      </div>

      <div className="flex text-left flex-col mt-0 h-48 border-gray-400 border-2 p-4 justify-center">
        <p className="mb-1 text-xl font-bold">Notes:</p>
        <textarea className="border-0 w-full h-full resize-none focus:outline-none"></textarea>
      </div>
    </div>
  );
};

export default DiagramLED;
