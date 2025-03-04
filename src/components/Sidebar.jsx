import React, { useEffect, useState } from "react";
import SelectInput from "./SelectInput";
import DimensionItem from "./DimensionItem";
import ChoosableOptions from "./ChoosableOption";
import TextInputGroup from "./TextInputGroup";
import TextInput from "./TextInput";
import useExcelData from "../hook/formData";
import { useSheetDataStore } from "../zustand/sheetDataStore";
import useDescriptionDataStore from "../zustand/descriptionDataStore";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import Hamburger from "./Hamburger";
import DownloadIcon from '@mui/icons-material/Download';

const Sidebar = ({ toPDF, targetRef, isOpen, toggleSidebar}) => {
  const [selectedUnit, setSelectedUnit] = useState("cm");
  //hamburger menu

  console.log(isOpen)


  // description form states
  const { formData, setFormData } = useDescriptionDataStore((state) => state);



  // function to set changes in state


  // sheetData state
  const { sheetData, loading, error } = useExcelData("/Db.xlsx");

  // sheetData info state
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
    setVarientDepth
  } = useSheetDataStore((state) => state);

  // Getting data right when rendered
  useEffect(() => {
    if (sheetData) {
      setSelectedScreen(sheetData.sheet1[0]);
      setSelectedMediaPlayer(sheetData.sheet2[0]);
      setSelectedMount(sheetData.sheet3[0]);
      setSelectedReceptacleBox(sheetData.sheet4[0]);
    }
  }, [sheetData]);

  // Function to set default values for all fields

  if (!selectedScreen) return null;

  return (
    <div className={`overflow-y-auto h-full fixed w-72 lg:right-0 transition-all bg-white  top-0 pt-14 shadow-xl lg:shadow-none  ${isOpen ? "right-0" : "-right-72"}`}>
      <div className="w-full p-2 gap-96">
        <div className="w-full lg:border">
          <p className="pl-5 pt-4 text-start font-bold text-lg mb-5">
            Configuration
          </p>
          <form className="flex mt-1 flex-col items-center justify-around text-start pb-2">
            <SelectInput
              label="Screen"
              value={selectedScreen["Screen MFR"]}
              options={sheetData.sheet1.map((sh) => ({
                value: sh["Screen MFR"],
                label: sh["Screen MFR"],
              }))}
              onChange={(e) =>
                setSelectedScreen(
                  sheetData.sheet1.find(
                    (q) => q["Screen MFR"] === e.target.value
                  )
                )
              }
            />
            <SelectInput
              label="Media Player"
              value={selectedMediaPlayer["MFG. PART"]}
              options={sheetData.sheet2.map((sh) => ({
                value: sh["MFG. PART"],
                label: sh["MFG. PART"],
              }))}
              onChange={(e) =>
                setSelectedMediaPlayer(
                  sheetData.sheet2.find((q) => q["MFG. PART"] === e.target.value)
                )
              }
            />
            <SelectInput
              className="text-center"
              label="Mount"
              value={selectedMount["MFG. PART"]}
              options={sheetData.sheet3.map((sh) => ({
                value: sh["MFG. PART"],
                label: sh["MFG. PART"],
              }))}
              onChange={(e) =>
                setSelectedMount(
                  sheetData.sheet3.find((q) => q["MFG. PART"] === e.target.value)
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
 <div className="grid mt-2 grid-cols-1 px-4 ">
<DimensionItem
                className="flex flex-row items-center justify-between border bg-gray-100 border-gray-300 h-8"
                label=" Distance"
                value="3'"
                hasBorder = "true"
              />
              </div>

              <SelectInput
  label="Unit"
  options={[
    { value: "cm", label: "Centimeter" },
    { value: "in", label: "Inches" }
  ]}
  value={selectedUnit}
  onChange={(e) => setSelectedUnit(e.target.value)}
  className="text-center"
/>
              
            <div className="grid mt-2 grid-cols-1 px-4">
              <DimensionItem
                className="flex flex-row items-center justify-between bg-gray-100 border border-gray-300 h-8"
                label="Floor Distance"
                value="50"
                hasBorder = "true"
              />
              <DimensionItem
                className="flex flex-row items-center justify-between border bg-gray-100 border-gray-300 h-8"
                label="Niche Depth var"
                value={variantDepth}
                hasBorder = "true"
                onChange={(e) => setVarientDepth(e.target.value)}
              />
            </div>
            <div className="grid w-full grid-cols-2 px-4 ">
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
          </form>
        </div>
      </div>
      <div
        onClick={(e) => {
          e.preventDefault();
          toPDF();
        }}
      className=" h-16 fixed bottom-0 justify-center items-center flex flex-row no-wrap">
        {/* <div className="w-full lg:border">
          <form className="grid grid-col grid-cols-1 text-start">
            <TextInputGroup title="Description">
              <TextInput
                label="Title"
                placeholder="Enter title"
                value={formData.title}
                onChange={(e) => setFormData("title", e.target.value)}
              />
              <TextInput
                label="Drawer"
                placeholder="Enter drawer name"
                value={formData.drawer}
                onChange={(e) => setFormData("drawer", e.target.value)}
              />
              <TextInput
                label="Department"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => setFormData("department", e.target.value)}
              />
              <TextInput
                label="Screen Size"
                placeholder="Enter screen size"
                value={formData.screenSize}
                onChange={(e) => setFormData("screenSize", e.target.value)}
              />
              <TextInput
                label="Date"
                placeholder="Enter date"
                value={formData.date}
                onChange={(e) => setFormData("date", e.target.value)}
              />
            </TextInputGroup>
            
           
            

          </form>
        </div> */}
     
        <button 
            
              className="w-60 h-8 m-auto px-1 text-white bg-blue-700 font-semibold border-2 border-transparent hover:border-orange-600 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              Download
            </button>
            <div className=" bg-blue-700 text-white h-8 w-10">
            <DownloadIcon/>
            </div>
      </div>
      
    </div>
  );
};

export default Sidebar;
