import React from "react";

const DimensionGroup = ({ title, children }) => {
  return (
    <div className="border border-gray-300 rounded-sm p-3 md:w-2/3 bg-white shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default DimensionGroup;
