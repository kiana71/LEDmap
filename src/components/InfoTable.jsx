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

  // Instead of using controlled inputs, let's use uncontrolled inputs with defaultValue
  // and only update the state when the input loses focus
  // This approach avoids the React re-render focus issues

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
        className="w-full outline-none text-center text-md px-1 py-1 focus:border-b focus:bg-gray-400 focus:border-gray-400"
        style={{
          backgroundColor: 'transparent',
          transition: 'background-color 0.1s, border 0.1s',
          height: '100%',
          minHeight: '40px'
        }}
      />
    );
  };

  return (
    <div className="border shadow-sm bg-white h-full">
      {/* Header with Logo and Address */}
      <div className="flex items-center justify-between  border-b border-gray-200">
        <div className="w-1/3">
          <img className="h-6" src={Logo} alt="Signcast Media" />
        </div>
        <div className="w-2/3 text-right text-md leading-tight">
          <div className="text-right w-full mb-1 px-1">{fixedContent.address} , {fixedContent.city}</div>
          {/* <div className="text-right w-full mb-1 px-1">{fixedContent.city}</div> */}
          <div className="text-right w-full px-1">{fixedContent.phone}</div>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse text-md">
        <tbody>
          {/* Row 1 - Drawn / Dimensions / Mounting / Orientation Headers */}
          <tr>
            <td className="border border-gray-200 bg-white   w-1/6 text-center  text-md">
              Drawn
            </td>
            <td className="border border-gray-200 bg-white   w-1/6 text-center text-md" rowSpan="2">
              <div className="flex flex-row items-center justify-center">
                <span className="mr-2">Dimensions<br />In Inches</span>
                <img className="w-12 h-auto" src={mapIcon} alt="mapIcon"/>
              </div>
            </td>
            <td className="border border-gray-200 bg-white   w-1/6 text-center text-md">
              Mounting In/On
            </td>
            <td className="border border-gray-200 bg-white   w-1/6 text-center text-md">
              Orientation
            </td>
          </tr>
          
          {/* Row 2 - Values for Drawn / Mounting / Orientation */}
          <tr>
            <td className="border border-gray-200   text-center">
              <StyledInput field="drawn" />
            </td>
            {/* Dimensions cell is handled in the rowspan above */}
            <td className="border border-gray-200   text-center">
              <StyledInput field="mountingInOn" />
            </td>
            <td className="border border-gray-200   text-center">
              <StyledInput field="orientation" />
            </td>
          </tr>
          
          {/* Row 3 - Headers for Date / Screen / Mount / Media Player */}
          <tr>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Date
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md" colSpan="1">
              Screen
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Mount
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Media Player
            </td>
          </tr>
          
          {/* Row 4 - Values for Date / Screen / Mount / Media Player */}
          <tr>
            <td className="border border-gray-200   text-center">
              <StyledInput field="date" />
            </td>
            <td className="border border-gray-200   text-center" colSpan="1">
              <StyledInput field="screen" />
            </td>
            <td className="border border-gray-200   text-center">
              <StyledInput field="mount" />
            </td>
            <td className="border border-gray-200   text-center">
              <StyledInput field="mediaPlayer" />
            </td>
          </tr>
          
          {/* Row 5 - Headers for Sheet / Revision / Department / Drawing No */}
          <tr>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Sheet
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Revision
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md" colSpan="1">
              Department
            </td>
            <td className="border border-gray-200 bg-white   text-center text-md">
              Drawing No:
            </td>
          </tr>
          
          {/* Row 6 - Values for Sheet / Revision / Department / Drawing No */}
          <tr>
            <td className="border border-gray-200   text-center">
              <StyledInput field="sheet" />
            </td>
            <td className="border border-gray-200   text-center">
              <StyledInput field="revision" />
            </td>
            <td className="border border-gray-200   text-center" colSpan="1">
              <StyledInput field="department" />
            </td>
            <td className="border border-gray-200   text-center">
              <StyledInput field="drawingNo" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InfoTable;