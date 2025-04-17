import React, { useState, useEffect, useRef } from 'react';
import useApiStore from '../../store/apiStore';
import useExcelData from '../../hook/formData';
import { format } from 'date-fns';

const DataLoadSaveBtn = () => {
  const [searchDrawingNo, setSearchDrawingNo] = useState('');
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

  const apiStore = useApiStore();
  const { sheetData, loading: sheetLoading } = useExcelData(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQH7Uju3LbhqpO7joSwpTvCmAQMK79pspbH_Qnc1pNgMUUk-jFzvE1DSOBedsYc5l21It8bsE7yX3X6/pub?output=xlsx"
  );

  useEffect(() => {
    // Fetch drawings when component mounts
    apiStore.fetchSavedDrawings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLoad = async (drawingNumber) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!drawingNumber) {
        setError('Please enter a drawing number');
        return;
      }

      // Check if the drawing exists in the saved drawings
      const drawingExists = apiStore.savedDrawings.some(
        drawing => drawing.drawingNumber === drawingNumber
      );

      if (!drawingExists) {
        setError('Drawing not found');
        return;
      }

      // Check if sheet data is loaded
      if (sheetLoading) {
        setError('Loading sheet data...');
        return;
      }

      if (!sheetData?.sheet1 || !sheetData?.sheet2 || !sheetData?.sheet3 || !sheetData?.sheet4) {
        setError('Sheet data not available. Please try again.');
        return;
      }

      // Load the drawing with sheet data
      await apiStore.loadDrawing(drawingNumber, sheetData);
      setShowList(false);
    } catch (err) {
      console.error('Error loading drawing:', err);
      setError(err.message || 'Error loading drawing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDrawing = (drawingNumber) => {
    setSearchDrawingNo(drawingNumber);
    setShowList(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!sheetData?.sheet1 || !sheetData?.sheet2 || !sheetData?.sheet3 || !sheetData?.sheet4) {
        setError('Sheet data not available. Please try again.');
        return;
      }

      // Check if the drawing number already exists
      const drawingExists = apiStore.savedDrawings.some(
        drawing => drawing.drawingNumber === sheetData.sheet1[0]?.drawingNumber
      );

      if (drawingExists) {
        setError('This drawing number already exists. Enter a different number.');
        return;
      }

      await apiStore.saveDrawing(sheetData);
      setShowList(false);
    } catch (err) {
      console.error('Error saving drawing:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(`Error saving drawing: ${err.response.data.message || 'Server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (drawingNumber) => {
    apiStore.deleteDrawing(drawingNumber);


  };

  console.log(apiStore);
  return (
    <div className="px-4 py-3 border-b">
      <div className="text-sm mb-2 font-semibold">Search Drawing Number</div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 relative" ref={dropdownRef}>
          <input
       // fahmidam, vafgti dlete mikone , bayad fetchdrawing store dobare seda zade beshge
            value={searchDrawingNo}
            onChange={(e) => setSearchDrawingNo(e.target.value)}
            onFocus={() => {
              setShowList(true);
              apiStore.fetchSavedDrawings();
            }}
            placeholder="Enter SC-XXXX"
            className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
            disabled={isLoading || sheetLoading}
          />
          <button
            onClick={() => handleLoad(searchDrawingNo)}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            disabled={isLoading || sheetLoading}
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
          {showList && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
              {apiStore.isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
              ) : !apiStore.savedDrawings || apiStore.savedDrawings.length === 0 ? (
                <div className="flex items-centerp-2 text-sm text-gray-500">No saved drawings</div>
              ) : (
                apiStore.savedDrawings
                  .filter(drawing => drawing && drawing.drawingNumber)
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((drawing) => (
                    <div
                      key={drawing._id}
                      className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      onClick={() => handleSelectDrawing(drawing.drawingNumber)}
                    >
                      <div className='flex flex-col items-center justify-center text-center'>
                        <div className="font-medium text-sm text-center">
                          {drawing.drawingNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {drawing.createdAt && format(new Date(drawing.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(drawing.drawingNumber);
                        }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </div>
                  ))
              )}
            </div>
          )}
          
        </div>
        <button
          onClick={handleSave}
          className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors disabled:bg-gray-400"
          disabled={isLoading || sheetLoading || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default DataLoadSaveBtn;