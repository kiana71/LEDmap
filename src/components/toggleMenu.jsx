import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useSheetDataStore } from '../zustand/sheetDataStore';

// Create a context with default values for visibility
export const VisibilityContext = createContext({
  visibleElements: {
    floorLine: true,
    centreLine: true,
    woodBacking: true,
    receptacleBox: true,
    intendedPosition: true,
  },
  toggleVisibility: () => {}
});

// Hook to use the visibility context
export const useVisibility = () => useContext(VisibilityContext);

// Separate visibility provider that can wrap the entire app
export const VisibilityProvider = ({ children }) => {
  const sheetStore = useSheetDataStore();
  
  // Get visibility states from sheetDataStore
  const visibleElements = {
    floorLine: sheetStore.floorLine,
    centreLine: sheetStore.centreLine,
    woodBacking: sheetStore.woodBacking,
    receptacleBox: sheetStore.receptacleBox,
    intendedPosition: sheetStore.intendedPosition,
  };

  // Toggle option handler that updates sheetDataStore
  const toggleVisibility = (id) => {
    switch (id) {
      case 'floorLine':
        sheetStore.setFloorLine(!visibleElements.floorLine);
        break;
      case 'centreLine':
        sheetStore.setCentreLine(!visibleElements.centreLine);
        break;
      case 'woodBacking':
        sheetStore.setWoodBacking(!visibleElements.woodBacking);
        break;
      case 'receptacleBox':
        sheetStore.setReceptacleBox(!visibleElements.receptacleBox);
        break;
      case 'intendedPosition':
        sheetStore.setIntendedPosition(!visibleElements.intendedPosition);
        break;
      default:
        break;
    }
  };

  return (
    <VisibilityContext.Provider value={{ visibleElements, toggleVisibility }}>
      {children}
    </VisibilityContext.Provider>
  );
};

// Toggle Option components
const ToggleOption = ({ label, isActive, onToggle }) => {
  return (
    <div className="py-2 px-4 my-1 flex items-center justify-between bg-white rounded-md shadow-sm">
      <span className="text-lg font-medium">{label}</span>
      <div
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${isActive ? 'bg-blue-500 '  : 'bg-gray-200'}`}
        onClick={onToggle}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
            isActive ? 'transform translate-x-8' : 'transform translate-x-1'
          }`}
        />
      </div>
    </div>
  );
};

// The ToggleOptionsMenu component - floating accordion style
const ToggleOptionsMenu = ({ title = "Show/Hide Elements" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { visibleElements, toggleVisibility } = useVisibility();
  const contentRef = useRef(null);
  const menuRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  
  // Update content height when opening/closing
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);
  
  // Get current options with their active states from the context
  const options = [
    { id: 'floorLine', label: 'Floor Line', isActive: visibleElements.floorLine },
    { id: 'centreLine', label: 'Centre Line', isActive: visibleElements.centreLine },
    { id: 'woodBacking', label: 'Wood Backing', isActive: visibleElements.woodBacking },
    { id: 'receptacleBox', label: 'Receptacle Box', isActive: visibleElements.receptacleBox },
    { id: 'intendedPosition', label: 'Intended', isActive: visibleElements.intendedPosition },
  ];

  return (
    <div className="w-full max-w-md mx-auto relative" ref={menuRef}>
      {/* Header - always visible */}
      <div
        className="bg-white shadow-md rounded-md p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-gray-50 z-10 relative"
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
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Accordion content with absolute positioning */}
      <div 
        ref={contentRef}
        className="bg-gray-100 shadow-md rounded-md overflow-hidden transition-all duration-300 ease-in-out absolute w-full z-20"
        style={{ 
          maxHeight: `${contentHeight}px`,
          opacity: isOpen ? 1 : 0,
          top: '100%',
          left: 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        <div className="p-4">
          {options.map(option => (
            <ToggleOption
              key={option.id}
              label={option.label}
              isActive={option.isActive}
              onToggle={() => toggleVisibility(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToggleOptionsMenu;