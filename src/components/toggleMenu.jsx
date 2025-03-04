import React, { useState } from 'react';

const ToggleOption = ({ label, isActive, onToggle }) => {
  return (
    <div className="py-3 px-4 my-2 flex items-center justify-between bg-white">
      <span className="text-lg font-medium">{label}</span>
      <div 
        className={`relative w-14 h-7 rounded-full transition-colors duration-200 cursor-pointer ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
        onClick={onToggle}
      >
        <div 
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            isActive ? 'transform translate-x-7' : 'transform translate-x-1'
          }`}
        />
      </div>
    </div>
  );
};

const ToggleOptionsMenu = ({ title = "Show/Hide Elements" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([
    { id: 'floorLine', label: 'Floor Line', isActive: true },
    { id: 'centreLine', label: 'Centre Line', isActive: true },
    { id: 'wallHanging', label: 'Wall Hanging', isActive: true },
    { id: 'receptacleBox', label: 'Receptacle Box', isActive: true },
  ]);

  const toggleOption = (id) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, isActive: !option.isActive } : option
    ));
  };

  return (
    <div className="w-full md:w-2/3 mx-auto mt-6 mb-4">
      <div 
        className="bg-white border border-gray-300 rounded-sm shadow-sm p-4 mb-2 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 9L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 12L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 15L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2 className="text-lg font-semibold ml-2">{title}</h2>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="bg-gray-100 border border-gray-300 rounded-sm shadow-sm p-4 transition-all duration-200">
          {options.map(option => (
            <ToggleOption 
              key={option.id}
              label={option.label}
              isActive={option.isActive}
              onToggle={() => toggleOption(option.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ToggleOptionsMenu;