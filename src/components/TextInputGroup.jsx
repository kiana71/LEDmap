import React from 'react';

const TextInputGroup = ({ title, children }) => {
  return (
    <div className="w-full px-4 py-2 bg-white ">
      <p className="font-bold text-sm mb-1 text-gray-800 ">{title}</p>
      {children}
    </div>
  );
}

export default TextInputGroup;
