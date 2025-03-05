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
    variantDepth
  } = useSheetDataStore((state) => state);

  const nicheDepth = parseFloat(selectedScreen?.Depth || 0) + parseFloat(findMax((selectedMediaPlayer?.Depth || 0), (selectedMount ? selectedMount["Depth (in)"] : 0))) + parseFloat(variantDepth || 0);

  // The formula for calculating niche depth is: Screen depth + Max(Media player depth, Mount depth) + Depth variance
  return selectedScreen ? (
    <div className="w-full h-full p-2 bg-white border-gray-200 flex  flex-col justify-between">
      <div className="flex justify-center md:justify-end mb-4 pt-10 pr-10">
        {/* Right corner container with fixed width (half width) */}
        <div className="w-full md:w-2/3 lg:w-2/6 flex flex-row md:flex-col  gap-2">
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
              value={nicheDepth.toFixed(2)}
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