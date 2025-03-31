import React from "react";

const DimensionGroup = ({ title, children }) => {
  return (
    <div className="rounded-sm  bg-white  ">
      <h3 className="font-extrabold text-gray-700 mb-1 mt-1 text-center text-[15px]">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
};
export default DimensionGroup;
