import React from "react";
import DimensionGroup from "./DimensionGroup";
import DimensionItem from "./DimensionItem";
import InfoTable from "./InfoTable";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { findMax } from "../utils/numberUtils";
import ToggleOptionsMenu from "./toggleMenu";

const DimensionBoxes = () => {
  const {
    selectedScreen,
    selectedReceptacleBox,
    selectedMediaPlayer,
    selectedMount,
    variantDepth,
  } = useSheetDataStore((state) => state);
  
  
  // Calculate raw nicheDepth
const rawNicheDepth = parseFloat(selectedScreen?.Depth || 0) + 
parseFloat(findMax((selectedMediaPlayer?.Depth || 0), 
(selectedMount ? selectedMount["Depth (in)"] : 0))) + 
parseFloat(variantDepth || 0);

// Force to nearest 1/8th inch (0.125)
const roundToNearest8th = (num) => {
// Get the whole number part
const wholePart = Math.floor(num);

// Get the decimal part
const decimalPart = num - wholePart;

// The possible 1/8th fractions
const eighths = [0, 0.125, 0.250, 0.375, 0.500, 0.625, 0.750, 0.875, 1];

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


 
  //result of the nichedepht should be these : .125 , .250 , .375 , .5 , .625 , .750 , .875 , 1
  if (rawNicheDepth)
    // The formula for calculating niche depth is: Screen depth + Max(Media player depth, Mount depth) + Depth variance
    return selectedScreen ? (
      <div className="w-full h-full p-2 bg-white border-gray-200 flex  flex-col justify-between">
        <div className="flex justify-center md:justify-end mb-4 pt-10 pr-10">
          {/* Right corner container with fixed width (half width) */}
          <div className="w-full md:w-2/3 lg:w-1/3 flex flex-row md:flex-col  gap-2">
            {/* Screen Dimensions */}
            <DimensionGroup title="Screen Dimensions" className="w-full">
              <DimensionItem
                label="Height"
                value={selectedScreen["Height"] || 0}
                className="flex flex-row items-center justify-between border-b border-black h-8"
              />
              <DimensionItem
                label="Width"
                value={selectedScreen["Width"] || 0}
                className="flex flex-row items-center justify-between border-b border-black h-8"
              />
              <DimensionItem
                label="Depth"
                value={selectedScreen["Depth"] || 0}
                className="flex flex-row items-center justify-between border-b border-black h-8"
              />
            </DimensionGroup>

            {/* Niche Dimensions */}
            <DimensionGroup title="Niche Dimensions" className="w-full">
             
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
                className="items-center text-center justify-between border-b border-black h-8"
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
                className="flex flex-row items-center justify-between border-b border-black h-8"
              />
              <DimensionItem
                label="Depth"
                value={nicheDepth.toFixed(3)}
                className="flex flex-row items-center justify-between border-b border-black h-8"
              />
            </DimensionGroup>

            {/* Toggle Options Menu */}
            <div className="w-full">
              <ToggleOptionsMenu />
            </div>
          </div>
        </div>

        {/* InfoTable at the bottom */}
        <div className="w-full">
          <InfoTable />
        </div>
      </div>
    ) : null;
};

export default DimensionBoxes;
