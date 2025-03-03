import React, { useState } from "react";

// Individual rectangle (option) component
const ChoosableOptions = ({ label, isSelected, onSelect }) => {
  return (
    <div
      className={`flex items-center h-7 justify-center border border-gray-300 cursor-pointer p-1 rounded-sm w-full ${
        isSelected ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
      }`}
      onClick={onSelect}
    >
      {label}
    </div>
  );

};

export default ChoosableOptions;
