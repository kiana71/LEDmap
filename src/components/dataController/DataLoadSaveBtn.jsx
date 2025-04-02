




const DataLoadSaveBtn = () => {

  return (
    <div className="px-4 py-3 border-b">
    <div className="text-sm mb-2 font-semibold">Search Drawing Number</div>
    <div className="flex gap-2">
      <input
        type="text"
        // value={searchDrawingNo}
        // onChange={(e) => setSearchDrawingNo(e.target.value)}
        placeholder="Enter SC-XXXX"
        className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        // onClick={handleLoad}
        className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
      >
        Load
      </button>
    </div>
    
    {/* Save Configuration Button */}
    <div className="mt-3">
      <button
        // onClick={handleSave}  // Empty function for now
        className="w-full py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save Configuration
      </button>
    </div>
  </div>
  )
}

export default DataLoadSaveBtn;