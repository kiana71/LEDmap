import React, { useEffect } from "react";
import DimensionItem from "./DimensionItem";
import useExcelData from "../hook/formData";
import { useSheetDataStore } from "../zustand/sheetDataStore";

const NotesSection = () => {
  const { sheetData, loading, error } = useExcelData("/Db.xlsx");
  const {
    selectedReceptacleBox,
    setSelectedReceptacleBox
  } = useSheetDataStore((state) => state);

  useEffect(() => {
    setSelectedReceptacleBox(sheetData.sheet4);
  }, [sheetData]);

  return (
    <>
      {selectedReceptacleBox?.Brand && (
        <div className="text-start border border-gray-300 rounded-sm p-4 mb-2 shadow-sm">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-700">Notes</h3>
          <div className="flex items-center justify-around">
            {/* Text Description */}
            <p className="text-gray-600 text-sm">
              Install recessed receptacle box with:
              <br />
              2x Terminated Power Outlets
              <br />
              1x Terminated Data CAT5 Ethernet Outlet
            </p>
            {/* Dimension section */}
            <div className="flex flex-col gap-2">
              <DimensionItem
                label="Height"
                value={selectedReceptacleBox?.["Height (in)"] || ""}
                className="flex flex-row items-center justify-around border border-gray-300 h-8"
              />
              <DimensionItem
                label="Width"
                value={selectedReceptacleBox?.["Width (in)"] || ""}
                className="flex flex-row items-center justify-between border border-gray-300 h-8"
              />
              <DimensionItem
                label="Depth"
                value={selectedReceptacleBox?.["Depth (in)"] || ""}
                className="flex flex-row items-center justify-between border border-gray-300 h-8"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default NotesSection;
