import React, { useEffect } from "react";
import SelectInput from "./SelectInput";
import DimensionItem from "./DimensionItem";
import ChoosableOptions from "./ChoosableOption";
import useExcelData from "../hook/formData";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import useDescriptionDataStore from "../zustand/descriptionDataStore";
import DownloadIcon from "@mui/icons-material/Download";
import ToggleOptionsMenu from "./toggleMenu";
import DataLoadSaveBtn from "./dataController/DataLoadSaveBtn";
import {
  createIncrementHandler,
  createDecrementHandler,
  increment,
  decrement,
} from "../utils/incrementUtils";


const Sidebar = ({ toPDF, isOpen, exportToPDF }) => {
  // Get all state and methods from the store
  const {
    selectedScreen,
    selectedMediaPlayer,
    selectedMount,
    selectedReceptacleBox,
    setSelectedScreen,
    setSelectedMediaPlayer,
    setSelectedMount,
    setSelectedReceptacleBox,
    isHorizontal,
    isNiche,
    toggleIsHorizontal,
    toggleIsNiche,
    variantDepth,
    setVariantDepth,
    setFloorDistance,
    floorDistance,
    canDownload,

    // Receptacle box settings
    bottomDistance,
    setBottomDistance,
    leftDistance,
    setLeftDistance,
    boxGap,
    setBoxGap,
    boxCount,
    setBoxCount,
    incrementBoxCount,
    decrementBoxCount,
    maxBoxesReached,
    updateBoxPositions,
    // isEditMode,
    // setIsEditMode,
    // Limit flags
    isAtMaxBottomDistance,
    isAtMaxLeftDistance,
    isAtMaxBoxGap,
    toggleIsEdgeToEdge,
    isEdgeToEdge,
    isColumnLayout,
    toggleIsColumnLayout,
  } = useSheetDataStore();

  // Description form states

  // Sheet data state
  const { sheetData, loading, error } = useExcelData(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH7Uju3LbhqpO7joSwpTvCmAQMK79pspbH_Qnc1pNgMUUk-jFzvE1DSOBedsYc5l21It8bsE7yX3X6/pub?output=xlsx"
  );
useEffect(() => {
  console.log('boxCount:', boxCount);
}, [boxCount]);
  // Getting data right when rendered
  useEffect(() => {
    if (sheetData) {
      setSelectedScreen({ "Screen MFR": "" });
      setSelectedMediaPlayer({ "MFG. PART": "" });
      setSelectedMount({ "MFG. PART": "" });
      setSelectedReceptacleBox(null);
    }
  }, [
    sheetData,
    setSelectedScreen,
    setSelectedMediaPlayer,
    setSelectedMount,
    setSelectedReceptacleBox,
  ]);

  // Update box positions when screen dimensions or box settings change
  useEffect(() => {
    if (boxCount > 0) {
      updateBoxPositions();
    }
  }, [
    selectedScreen,
    isHorizontal,
    bottomDistance,
    leftDistance,
    boxGap,
    updateBoxPositions,
    boxCount,
  ]);

  // if (!selectedScreen) return null;

  // Handle floor distance change

  // Floor distance handlers
  const incrementFloorDistance = (e) => {
    e.preventDefault();
    setFloorDistance(floorDistance + 1);
  };

  const decrementFloorDistance = (e) => {
    e.preventDefault();
    if (floorDistance > 0) {
      setFloorDistance(floorDistance - 1);
    }
  };

  // Variant depth handlers
  const incrementVariantDepth = (e) => {
    e.preventDefault();
    setVariantDepth(variantDepth + 0.5);
  };

  const decrementVariantDepth = (e) => {
    e.preventDefault();
    if (variantDepth > 0) {
      setVariantDepth(variantDepth - 0.5);
    }
  };

  // Bottom distance handlers
  const incrementBottomDistance = (e) => {
    e.preventDefault();
    setBottomDistance(bottomDistance + 0.5);
  };

  const decrementBottomDistance = (e) => {
    e.preventDefault();
    if (bottomDistance > 0) {
      setBottomDistance(bottomDistance - 0.5);
    }
  };

  // Left distance handlers
  const incrementLeftDistance = (e) => {
    e.preventDefault();
    setLeftDistance(leftDistance + 0.5);
  };

  const decrementLeftDistance = (e) => {
    e.preventDefault();
    if (leftDistance > 0) {
      setLeftDistance(leftDistance - 0.5);
    }
  };

  // Box gap handlers
  const incrementBoxGap = (e) => {
    e.preventDefault();
    setBoxGap(boxGap + 0.5);
  };

  const decrementBoxGap = (e) => {
    e.preventDefault();
    if (boxGap > 0) {
      setBoxGap(boxGap - 0.5);
    }
  };

  return (
    <div
      className={`overflow-y-auto h-full fixed w-80 lg:right-0 transition-all bg-white top-0 pt-14 shadow-xl lg:shadow-none pb-12 z-10 ${
        isOpen ? "right-0" : "-right-80"
      }`}
    >
      <div className="w-full p-2 gap-96">
        <div className="w-full lg:border ">
        <DataLoadSaveBtn />
          <p className="pl-5 pt-4 text-start font-bold text-lg mb-2">
            Configuration
          </p>
          <form className="flex mt-1 flex-col items-center justify-around text-start pb-2">
            <SelectInput
            className="text-center"
              label="Screen"
              value={selectedScreen?.["Screen MFR"] || ""}
              options={[
                { value: "", label: "Select option" },
                ...sheetData.sheet1.map((sh) => ({
                  value: sh["Screen MFR"],
                  label: sh["Screen MFR"],
                })),
              ]}
              onChange={(e) =>
                setSelectedScreen(
                  e.target.value === "" ? 
                  { "Screen MFR": "" } : 
                  sheetData.sheet1.find(
                    (q) => q["Screen MFR"] === e.target.value
                  )
                )
              }
            />
            <SelectInput
            className="text-center"
              label="Media Player"
              value={selectedMediaPlayer?.["MFG. PART"] || ""}
              options={[
                { value: "", label: "Select option" },
                ...sheetData.sheet2.map((sh) => ({
                  value: sh["MFG. PART"],
                  label: sh["MFG. PART"],
                })),
              ]}
              onChange={(e) =>
                setSelectedMediaPlayer(
                  e.target.value === "" ?
                  { "MFG. PART": "" } :
                  sheetData.sheet2.find(
                    (q) => q["MFG. PART"] === e.target.value
                  )
                )
              }
            />
            <SelectInput
              className="text-center"
              label="Mount"
              value={selectedMount?.["MFG. PART"] || ""}
              options={[
                { value: "", label: "Select option" },
                ...sheetData.sheet3.map((sh) => ({
                  value: sh["MFG. PART"],
                  label: sh["MFG. PART"],
                })),
              ]}
              onChange={(e) =>
                setSelectedMount(
                  e.target.value === "" ?
                  { "MFG. PART": "" } :
                  sheetData.sheet3.find(
                    (q) => q["MFG. PART"] === e.target.value
                  )
                )
              }
            />
            <SelectInput
              className="text-center"
              label="Receptacle Box"
              value={selectedReceptacleBox?.["MFG. PART"] || ""}
              options={[
                { value: "", label: "Select option" },
                ...sheetData.sheet4.map((sh) => ({
                  value: sh["MFG. PART"],
                  label: sh["MFG. PART"],
                })),
              ]}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === "") {
                  setSelectedReceptacleBox(null);
                } else {
                  const selectedBox = sheetData.sheet4.find(
                    (q) => q["MFG. PART"] === selectedValue
                  );
                  
                  setSelectedReceptacleBox(selectedBox);
                }
              }}
            />
            {/* Receptacle Box Count Control */}
            <div className="flex flex-col items-center mb-1 w-full px-4 ">
              <div className="mb-2 text-center font-semibold">
                Receptacle Box Settings
              </div>

              {/* Box Count */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Box Count:</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      decrementBoxCount();
                    }}
                    disabled={boxCount <= 1}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={boxCount}
                    disabled
                  
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setBoxCount(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.5"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      incrementBoxCount();
                    }}
                    disabled={maxBoxesReached}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Bottom Distance */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Bottom Distance (in):</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden rounded-md"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={decrementBottomDistance}
                    disabled={bottomDistance <= 0}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={bottomDistance.toFixed(2)}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setBottomDistance(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.01"
                  />

                  <button
                    type="button"
                    onClick={incrementBottomDistance}
                    disabled={isAtMaxBottomDistance}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Left Distance */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Left Distance (in):</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden rounded-md"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={decrementLeftDistance}
                    disabled={leftDistance <= 0}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={leftDistance.toFixed(2)}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setLeftDistance(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.01"
                  />

                  <button
                    type="button"
                    onClick={incrementLeftDistance}
                    disabled={isAtMaxLeftDistance}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Box Gap */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Box Gap (in):</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden rounded-md"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={decrementBoxGap}
                    disabled={boxGap <= 0}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={boxGap.toFixed(2)}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setBoxGap(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.01"
                  />

                  <button
                    type="button"
                    onClick={incrementBoxGap}
                    disabled={isAtMaxBoxGap}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Box Layout Direction */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Box Layout Direction:</div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleIsColumnLayout();
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded ${
                      isColumnLayout
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Column
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleIsColumnLayout();
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded ${
                      !isColumnLayout
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Row
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isColumnLayout
                    ? 'Boxes will fill down each column first'
                    : 'Boxes will fill right across each row first'}
                </p>
              </div>

              {maxBoxesReached && (
                <div className="text-red-500 text-sm text-center mb-2">
                  Maximum box limit reached for this Led size
                </div>
              )}

              <div className="text-sm text-gray-600 mb-2">
                Boxes will be placed starting from bottom-left
              </div>
            </div>

            <div className="flex flex-col items-center  w-full px-4">
              <div className="mb-2 text-center font-semibold">
                Display Settings
              </div>

              {/* Floor Distance with buttons */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Floor Distance (in):</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={decrementFloorDistance}
                    disabled={floorDistance <= 0}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={floorDistance}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setFloorDistance(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="1"
                  />

                  <button
                    type="button"
                    onClick={incrementFloorDistance}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Niche Depth Var with buttons */}
              <div className="w-full mb-3">
                <div className="text-sm mb-1">Niche Depth Var (in):</div>
                <div
                  className="flex items-center border border-gray-300 overflow-hidden"
                  style={{ height: "40px", width: "100%" }}
                >
                  <button
                    type="button"
                    onClick={decrementVariantDepth}
                    disabled={variantDepth <= 0}
                    className="ml-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md disabled:bg-gray-400"
                    style={{ borderRight: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">−</span>
                  </button>

                  <input
                    type="number"
                    value={variantDepth}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setVariantDepth(value);
                      }
                    }}
                    className="h-full flex-grow text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.5"
                  />

                  <button
                    type="button"
                    onClick={incrementVariantDepth}
                    className="mr-1 h-8 w-9 flex items-center justify-center bg-blue-400 text-white rounded-md"
                    style={{ borderLeft: "1px solid #e5e7eb" }}
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 px-4 mt-2">
              <ChoosableOptions
                label="Vertical"
                isSelected={!isHorizontal}
                onSelect={() => toggleIsHorizontal()}
              />
              <ChoosableOptions
                label="Horizontal"
                isSelected={isHorizontal}
                onSelect={() => toggleIsHorizontal()}
              />

              <ChoosableOptions
                label="Niche"
                isSelected={isNiche}
                onSelect={() => toggleIsNiche()}
              />
              <ChoosableOptions
                label="Flat Wall"
                isSelected={!isNiche}
                onSelect={() => toggleIsNiche()}
              />
            </div>
             <div className="flex flex-col items-center mb-1 w-full px-4 ">
              <div className="mb-0 mt-2 text-center font-semibold">
                Wood Backing
              </div>
              <div className="grid w-full grid-cols-2  mt-2">
              <ChoosableOptions
                label="Edge to edge"
                isSelected={isEdgeToEdge}
                onSelect={() => toggleIsEdgeToEdge()}
              />
              <ChoosableOptions
                label="3 Inches"
                isSelected={!isEdgeToEdge}
                onSelect={() => toggleIsEdgeToEdge()}
              />
              </div>
              </div>
            <div className="w-full pt-1 scroll-pb-96 pb-72 px-3">
              <ToggleOptionsMenu />
            </div>
          </form>
          {/* edit mode toggle */}
          {/* <div className="w-full px-4 my-4">
            <div className="flex justify-between items-center border border-gray-300 rounded p-2 bg-gray-50">
              <span className="text-sm font-medium">
                {isEditMode ? "Switch to View Mode" : "Switch to Edit Mode"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditMode}
                  onChange={(e) => setIsEditMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div> */}
          <div
            onClick={(e) => {
              e.preventDefault();
              exportToPDF();
            }}
            className={`z-30  fixed right-0 bottom-0 justify-center items-center flex-row no-wrap  w-80 ${
              !canDownload() ? 'hidden' : ''
            } lg:flex`}
          >
            <button 
              className={`h-9 m-auto px-1 text-white ${
                canDownload() ? 'bg-blue-700 hover:border-orange-600' : 'bg-gray-400 cursor-not-allowed'
              } font-semibold border-2 border-transparent shadow-md hover:shadow-lg transition-all duration-300 ease-in-out w-full flex items-center justify-between `}
              disabled={!canDownload()}
            >
              <div className="h-full flex justify-center flex-1 items-center">
                <span>Download</span>
              </div>
              <div className={`${canDownload() ? 'bg-blue-700' : 'bg-gray-400'} text-white flex h-full items-center`}>
                <DownloadIcon />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;