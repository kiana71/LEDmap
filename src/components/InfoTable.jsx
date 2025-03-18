import React, { useState } from "react";
import Logo from "../img/Logo_signcast_big-1080x322.png";
import mapIcon from "../img/mao icon-1080x322.png";

const InfoTable = () => {
  // Local state for form inputs with empty initial values
  const [tableData, setTableData] = useState({
    drawn: "",
    date: "",
    sheet: "",
    revision: "",
    department: "",
    drawingNo: "",
    screen: "",
    mount: "",
    mediaPlayer: "",
    mountingInOn: "",
    orientation: ""
  });

  // Fixed content that's not editable
  const fixedContent = {
    address: "261 Steelcase RD W #1",
    city: "MARKHAM, ONTARIO",
    phone: "Phone: (416) 900-2263"
  };

  // Update field handler that will be called on blur
  const updateField = (field, value) => {
    setTableData({
      ...tableData,
      [field]: value
    });
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
      <div className="border border-gray-300 shadow-sm bg-white h-full print:h-auto print:max-h-48 print:overflow-hidden">
        {/* Header with Logo and Address */}
        <div className="flex items-start justify-between border-b border-gray-300 h-[57px] px-4 py-2 print:h-12 print:py-1">
          <div className="w-1/3">
            <img className="h-8 print:h-6" src={Logo} alt="Signcast Media" />
          </div>
          <div className="w-2/3 text-right text-[11px] leading-[14px]">
            <div className="text-right w-full">{fixedContent.address}</div>
            <div className="text-right w-full">{fixedContent.city}</div>
            <div className="text-right w-full">{fixedContent.phone}</div>
          </div>
        </div>

        {/* Main Table - With explicit print styling */}
        <table className="w-full border-collapse text-[11px] print:text-[9px] print:w-full">
          <tbody>
            {/* Row 1 - Drawn / Dimensions / Mounting / Orientation Headers */}
            <tr className="h-[22px] print:h-4">
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0">
                Drawn
              </td>
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0" rowSpan="2">
                <div className="flex flex-row items-center justify-center h-full">
                  <span className="mr-1 border-r border-gray-300  print:text-[8px]">Dimensions<br />In Inches</span>
                  <img className="w-10 h-auto ml-2 print:w-6" src={mapIcon} alt="mapIcon"/>
                </div>
              </td>
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0">
                Mounting In/On
              </td>
              <td className="border-t-0 border border-gray-300 bg-white w-1/4 text-center p-0 print:p-0">
                Orientation
              </td>
            </tr>
            
            {/* Row 2 - Values for Drawn / Mounting / Orientation */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="drawn" />
              </td>
              {/* Dimensions cell is handled in the rowspan above */}
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="mountingInOn" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="orientation" />
              </td>
            </tr>
            
            {/* Row 3 - Headers for Date / Screen / Mount / Media Player */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Date
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Screen
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Mount
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Media Player
              </td>
            </tr>
            
            {/* Row 4 - Values for Date / Screen / Mount / Media Player */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="date" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="screen" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="mount" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="mediaPlayer" />
              </td>
            </tr>
            
            {/* Row 5 - Headers for Sheet / Revision / Department / Drawing No */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Sheet
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Revision
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Department
              </td>
              <td className="border border-gray-300 bg-white text-center p-0 print:p-0">
                Drawing No:
              </td>
            </tr>
            
            {/* Row 6 - Values for Sheet / Revision / Department / Drawing No */}
            <tr className="h-[22px] print:h-4">
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="sheet" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="revision" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="department" />
              </td>
              <td className="border border-gray-300 text-center p-0 print:p-0">
                <StyledInput field="drawingNo" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfoTable;