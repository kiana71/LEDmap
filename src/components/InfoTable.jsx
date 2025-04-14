import React, { useState, useEffect } from "react";
import Logo from "../img/Logo_signcast_big-1080x322.png";
import mapIcon from "../img/mao icon-1080x322.png";
import useApiStore from "../store/apiStore";

const InfoTable = () => {
  const apiStore = useApiStore();
  
  // Local state for form inputs with empty initial values
  const [tableData, setTableData] = useState({
    drawn: "",
    date: "",
    sheet: "",
    revision: "",
    department: "",
    drawingNumber: "",
    screen: "",
    mount: "",
    mediaPlayer: "",
    mountingInOn: "",
    orientation: ""
  });

  // Sync with apiStore when it changes
  useEffect(() => {
    if (apiStore.infoTableData) {
      console.log('InfoTable data updated:', apiStore.infoTableData);
      // Update local state with the complete infoTable data
      setTableData(prev => ({
        ...prev,
        ...apiStore.infoTableData
      }));
    }
  }, [apiStore.infoTableData]);

  // Initialize with apiStore data when component mounts
  useEffect(() => {
    if (apiStore.infoTableData) {
      console.log('Initial InfoTable data:', apiStore.infoTableData);
      setTableData(prev => ({
        ...prev,
        ...apiStore.infoTableData
      }));
    }
  }, []); // Empty dependency array means this runs once on mount

  // Fixed content that's not editable
  const fixedContent = {
    address: "361 Steelcase RD W #1 , MARKHAM, ONTARIO",
    phone: "Phone: (416) 900-2263"
  };

  // Update field handler that will be called on blur
  const updateField = (field, value) => {
    console.log('Updating field:', field, 'with value:', value);
    const newData = {
      ...tableData,
      [field]: value
    };
    setTableData(newData);
    // Update apiStore with the new data
    apiStore.setInfoTableData(newData);
  };

  // StyledInput component with CSS styling applied directly
  const StyledInput = ({ field }) => {
    return (
      <input
        type="text"
        value={tableData[field]}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full outline-none text-center text-[11px] focus:border-b focus:bg-gray-50 focus:border-gray-300 print:text-[9px] print:border-none"
        style={{
          backgroundColor: 'transparent',
          transition: 'background-color 0.1s, border 0.1s',
          height: '100%',
          minHeight: '16px',
          position: 'relative',
          zIndex: 1,
          cursor: 'text',
          padding: '0px 1px'
        }}
        // Add data attribute to make it easier to target with CSS
        data-print-field={field}
      />
    );
  };

  return (
    <div className="w-full h-full overflow-hidden print:overflow-visible">
      <div className="border border-gray-300 border-b-1 shadow-sm bg-white h-full print:h-auto print:max-h-36 print:overflow-hidden">
        {/* Header with Logo and Address */}
        <div className="flex items-start justify-between border-b border-gray-300 h-[57px] px-4 py-2 print:h-12 print:py-1">
          <div className="w-1/3">
            <img className="h-8 print:h-6" src={Logo} alt="Signcast Media" />
          </div>
          <div className="w-2/3 text-right text-[11px] leading-[14px]">
            <div className="text-right w-full">{fixedContent.address}</div>
            
            <div className="text-right w-full">{fixedContent.phone}</div>
          </div>
        </div>

        {/* Main Table - With explicit print styling */}
        <table className="w-full  text-[11px] print:text-[9px] print:w-full ">
          <tbody className="!border-r-red">
            {/* Row 1 - Drawn / Dimensions / Mounting/ Orientation Headers */}
            <tr className="h-[22px] print:h-4 font-bold">
              <td className="border-t-0 border border-gray-300 border-l-0 bg-white w-1/4 text-center p-0 print:p-0 table_input_td">
                Drawn
              </td>
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0" rowSpan="2">
                <div className="flex flex-row items-center justify-center h-full">
                  <span className="mr-1 border-r border-gray-300  print:text-[8px]">Dimensions<br />In Inches</span>
                  <img className="w-10 h-auto ml-2 print:w-6" src={mapIcon} alt="mapIcon"/>
                </div>
              </td>
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0 table_input_td">
                Mounting In/On
              </td>
              <td className="border-t-0 border border-gray-300 border-r-0 bg-white w-1/4 text-center p-0 print:p-0 table_input_td">
                Orientation
              </td>
            </tr>
            
            {/* Row 2 - Values for Drawn / Mounting / Orientation */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 border-l-0 text-center p-0 print:p-0">
                <TransparentInput field="drawn" onUpdate={updateField}/>
              </td>
              {/* Dimensions cell is handled in the rowspan above */}
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <TransparentInput field="dimensions" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 border-r-0 text-center p-0 print:p-0">
                <TransparentInput field="mountingInOn" onUpdate={updateField}/>
              </td>
            </tr>
            
            {/* Row 3 - Headers for Date / Screen / Mount / Media Player */}
            <tr className="h-[22px] print:h-4 font-bold">
              <td className="border border-gray-300 border-l-0 bg-white text-center p-0 print:p-0 table_input_td">
                Date
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0 table_input_td">
                Screen
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0 table_input_td">
                Mount
              </td>
              <td className="border border-gray-300 bg-white text-center border-r-0 p-0 print:p-0 table_input_td">
                Media Player
              </td>
            </tr>
            
            {/* Row 4 - Values for Date / Screen / Mount / Media Player */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 border-l-0 text-center p-0 print:p-0">
                <TransparentInput field="date" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <TransparentInput field="screen" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <TransparentInput field="mount" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 border-r-0 text-center p-0 print:p-0">
                <TransparentInput field="mediaPlayer" onUpdate={updateField}/>
              </td>
            </tr>
            
            {/* Row 5 - Headers for Sheet / Revision / Department / Drawing No */}
            <tr className="h-[22px] print:h-4 font-bold">
              <td className="border border-gray-300 border-l-0 bg-white text-center p-0 print:p-0 table_input_td">
                Sheet
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0 table_input_td">
                Revision
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0 table_input_td">
                Department
              </td>
              <td className="border border-gray-300 bg-white text-center border-r-0 p-0 print:p-0 table_input_td">
                Drawing No:
              </td>
            </tr>
            
            {/* Row 6 - Values for Sheet / Revision / Department / Drawing No */}
            <tr className="h-[22px] print:h-4 ">
              <td className="border border-gray-300 border-l-0 border-b-0 text-center p-0 print:p-0">
                <TransparentInput field="sheet" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 border-b-0 text-center p-0 print:p-0">
                <TransparentInput field="revision" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 border-b-0 text-center p-0 print:p-0">
                <TransparentInput field="department" onUpdate={updateField}/>
              </td>
              <td className="border border-gray-300 border-b-0 border-r-0 text-center p-0 print:p-0">
                <TransparentInput field="drawingNumber" onUpdate={updateField}/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfoTable;


const TransparentInput = ({ field, onUpdate }) => {
  const apiStore = useApiStore();
  const value = apiStore.infoTableData[field] || '';

  const handleChange = (e) => {
    const newValue = e.target.value;
    onUpdate(field, newValue);
  };

  return (
    <div className="relative w-full h-full">
      {/* Display div that shows the text */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-black pointer-events-none table_input">
        {value}
      </div>
      {/* Transparent input that captures text */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="bg-transparent w-full h-full outline-none border-none text-center text-transparent"
        style={{ caretColor: "black" }} // Makes cursor visible while text is transparent
      />
    </div>
  );
};