import React from "react";

const DimensionItem = ({ label, className, hasBorder= false, ...rest }) => {
  const borderStyle = hasBorder 
  ? "border  border-300" 
  : "";

  return (
    <div className={`flex items-center text-center  ${className}`}>
      <div className="flex justify-center  text-center w-1/2 items-center h-full ">
        <span className=" text-black  text-sm ">{label}</span>
      </div>

      <input
        type="text"
        className={`text-center h-7 w-1/2 focus:outline-none focus:ring-2 ${borderStyle}  focus:ring-blue-400`}
        {...rest}
      />
    </div>
  );
};

export default DimensionItem;