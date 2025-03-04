import React from "react";

const DimensionGroup = ({ title, children }) => {
  return (
    <div className="border border-gray-300 rounded-sm p-3 md:w-2/3 bg-white shadow-sm pb-10 md:mb-10">
      <h3 className="font-semibold text-gray-700 mb-4 text-center text-xl">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default DimensionGroup;
