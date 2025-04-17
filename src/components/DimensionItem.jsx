import React from "react";

const DimensionItem = ({ label, className, hasBorder = false, value, ...rest }) => {
  const borderStyle = hasBorder 
  ? "border  border-300" 
  : "";

  return (
    <div className={`v-dimension-item flex items-center text-center  ${className}`}>
      <div className="v-dimension-item-label flex justify-start  text-center w-1/2 items-center h-full ">
        <span className=" text-black  text-sm p_print">{label}</span>
      </div>
      <input
        type="text"
        readOnly
        value={value}
        className={`v-dimension-item-input text-end h-7 w-1/2 focus:outline-none  ${borderStyle}  `}
        {...rest}
      />
    </div>
  );
};

export default DimensionItem;