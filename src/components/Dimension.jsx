import React from "react";
import DimensionGroup from "./DimensionGroup";
import DimensionItem from "./DimensionItem";
import NotesSection from "./NoteSection";
import SignCastForm from "./SignCastForm";
import TextInputGroup from "./TextInputGroup";
import TextInput from "./TextInput";
import NoteSection from "./NoteSection";
import FormTable from "./InfoTable";
import InfoTable from "./InfoTable";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import { findMax } from "../utils/numberUtils"
import useExcelData from "../hook/formData";
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


  // The gap between outer box (niche) and screen varies: For screens under 55″: 1.5″ on each side / For screens over 55″: 2″ on each side. We recommend adding an input field to let users adjust this value.
  // The formula for calculating niche depth is: Screen depth + Max(Media player depth, Mount depth) + Depth variance
  return selectedScreen ? (
    <div className="w-full h-full p-2  bg-white border-gray-200 flex flex-col justify-between pt-10">
      <div>
        {/* <h2 className="text-md font-semibold text-gray-800 mb-6 text-center">
          Dimensions
        </h2> */}

        <div className="flex flex-row flex-wrap  gap-4 justify-center">
          {/* Niche Dimensions */}

       

          {/* Screen Dimensions */}
          <DimensionGroup title="Screen Dimensions">
            <DimensionItem
              label="Height"
              value={selectedScreen["Height"] || 0}
              className="flex flex-row items-center justify-between border-b border-black  h-8"
            />
            <DimensionItem
              label="Width"
              value={selectedScreen["Width"] || 0}
              className="flex flex-row items-center justify-between border-b border-black  h-8"
            />
            <DimensionItem
              label="Depth"
              value={selectedScreen["Depth"] || 0}
              className="flex flex-row items-center justify-between border-b border-black h-8"
            />
          </DimensionGroup>
          <DimensionGroup title="Niche Dimensions">
            <DimensionItem
              label="Height"
              value={
                selectedScreen?.["Screen Size"] // Ensure the "Height" property exists
                  ? (
                    parseFloat(selectedScreen["Height"]) +
                    (selectedScreen["Height"] < 55 ? 1.5 : 2) // Add 1.5 if height < 55, otherwise add 2
                  ).toFixed(2) // Convert to a string with two decimal places
                  : 0 // Fallback to 0 if "Height" is undefined
              }
              className="items-center text-center justify-between border-b border-black h-8"
            />
            <DimensionItem
              label="Width"
              value={
                selectedScreen?.["Screen Size"] // Ensure the "Height" property exists
                  ? (
                    parseFloat(selectedScreen["Width"]) +
                    (selectedScreen["Height"] < 55 ? 1.5 : 2) // Add 1.5 if height < 55, otherwise add 2
                  ).toFixed(2) // Convert to a string with two decimal places
                  : 0 // Fallback to 0 if "Height" is undefined
              }
              className="flex flex-row items-center justify-between border-b border-black  h-8"
            />
            <DimensionItem
              label="Depth"
              value={
                nicheDepth.toFixed(2)
              }
              className="flex flex-row items-center justify-between border-b border-black h-8"
            />
          </DimensionGroup>
        </div>
      </div>

      <div>
        {/* <div className="w-full">
          <NoteSection />
        </div> */}

        <div className="w-full">
          <InfoTable/>
        </div>
      </div>

    </div>
  ) : null;
};

export default DimensionBoxes;
