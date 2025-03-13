import React from 'react';

const ToolbarTestComponent = () => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg m-4 bg-white">
      <h2 className="text-lg font-bold mb-2">Floating Toolbar Test Area</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Try selecting text in each of these areas:</p>
        
        <div 
          contentEditable="true" 
          className="border p-3 mb-3 rounded min-h-16"
          style={{outline: 'none'}}
        >
          This is a proper contentEditable div. The floating toolbar should work here.
        </div>
        
        <textarea 
          className="border p-3 mb-3 rounded w-full min-h-16"
          defaultValue="This is a textarea. The toolbar may appear but formatting won't work here."
        />
        
        <input 
          type="text"
          className="border p-3 mb-3 rounded w-full"
          defaultValue="This is an input with contentEditable attribute"
          contentEditable="true"
        />
        
        <div className="border p-3 rounded">
          <div 
            contentEditable="true"
            className="w-full min-h-16 outline-none"
          >
            This is another contentEditable div styled similar to your InfoTable cells. 
            Formatting should work here.
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm">
        <p className="font-bold">Troubleshooting:</p>
        <ol className="list-decimal pl-4 mt-1">
          <li>The toolbar should appear when you select text in any area</li>
          <li>Formatting should only work in contentEditable divs (first and last examples)</li>
          <li>Formatting won't work in textarea or input elements even with contentEditable attribute</li>
          <li>Check browser console for debug information</li>
        </ol>
      </div>
    </div>
  );
};

export default ToolbarTestComponent;