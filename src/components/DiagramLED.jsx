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
  const { isHorizontal, isNiche, toggleIsHorizontal, toggleIsNiche ,selectedReceptacleBox , selectedMediaPlayer,
  selectedMount ,  selectedScreen,
  variantDepth
 } =
    useSheetDataStore((state) => state);

    const width = selectedScreen?.["Width"] || 0;
    
    const height = selectedScreen?.["Height"] || 0;
   


  return (
    <div className="w-full h-auto p-4 bg-white">
      <h2 className="text-md font-semibold text-gray-800 mb-6 items-center">
        Technical Map
      </h2>
      <svg
        width="100%"
        height="auto"
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
         {parseFloat(height) +
                    (height < 55 ? 1.5 : 2) }
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
          strokeDasharray="5,5"
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
          {
              width
            }
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
        {parseFloat(width) +
                    (width < 55 ? 1.5 : 2) }
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
        {
             height
            }
        </text>

        {/* Floor Line */}
        <line
          x1="90"
          y1="700"
          x2="700"
          y2="700"
          stroke="black"
          strokeWidth="1"
        />

        <line
          x1="90"
          y1="307"
          x2="90"
          y2="690"
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

        {/* Add a legend */}
        <g transform="translate(20, 0)">
          <rect
            width="150"
            height="80"
            fill={COLORS.background}
            stroke={COLORS.primary}
          />
          <text x="10" y="20" fontSize="12" fontWeight="bold">
            Legend:
          </text>
          <line
            x1="10"
            y1="35"
            x2="30"
            y2="35"
            stroke={COLORS.primary}
            strokeWidth="1.5"
          />
          <text x="35" y="40" fontSize="10">
            Critical Measurements
          </text>
          <line
            x1="10"
            y1="55"
            x2="30"
            y2="55"
            strokeDasharray="3,3"
            stroke={COLORS.primary}
          />
          <text x="35" y="60" fontSize="10">
            Reference Lines
          </text>
        </g>
      </svg>
    </div>
  );
};

export default DiagramLED;
