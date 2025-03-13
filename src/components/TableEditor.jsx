import React, { useState, useEffect } from 'react';
import { useSheetDataStore } from "../zustand/sheetDataStore";

/**
 * A simple table editor component for structured data
 */
const TableEditor = ({
  id = 'table-editor',
  title = 'Measurements Table',
  initialData = [
    { label: 'Width', value: '', unit: 'in' },
    { label: 'Height', value: '', unit: 'in' },
    { label: 'Depth', value: '', unit: 'in' }
  ],
  className = '',
  autoSave = true
}) => {
  const [rows, setRows] = useState(initialData);
  
  // Get and set table data from the global store
  const { 
    tableEditorData = {}, 
    updateTableEditorData = () => console.warn('updateTableEditorData not implemented in store')
  } = useSheetDataStore(state => state);

  // Initialize from store if available
  useEffect(() => {
    if (autoSave && tableEditorData && tableEditorData[id]) {
      setRows(tableEditorData[id]);
    }
  }, [id, autoSave, tableEditorData]);

  // Handle value changes
  const handleValueChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].value = value;
    setRows(updatedRows);
    
    if (autoSave) {
      updateTableEditorData(id, updatedRows);
    }
  };
  
  // Handle label changes
  const handleLabelChange = (index, label) => {
    const updatedRows = [...rows];
    updatedRows[index].label = label;
    setRows(updatedRows);
    
    if (autoSave) {
      updateTableEditorData(id, updatedRows);
    }
  };
  
  // Handle unit changes
  const handleUnitChange = (index, unit) => {
    const updatedRows = [...rows];
    updatedRows[index].unit = unit;
    setRows(updatedRows);
    
    if (autoSave) {
      updateTableEditorData(id, updatedRows);
    }
  };
  
  // Add a new row
  const addRow = () => {
    const updatedRows = [...rows, { label: 'New Measurement', value: '', unit: 'in' }];
    setRows(updatedRows);
    
    if (autoSave) {
      updateTableEditorData(id, updatedRows);
    }
  };
  
  // Remove a row
  const removeRow = (index) => {
    if (rows.length <= 1) return; // Keep at least one row
    
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    
    if (autoSave) {
      updateTableEditorData(id, updatedRows);
    }
  };

  return (
    <div className={`table-editor ${className}`}>
      <div className="mb-2 text-xl font-bold flex justify-between items-center">
        <span>{title}</span>
        <button
          onClick={addRow}
          className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          + Add
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left text-sm font-medium text-gray-700">Measurement</th>
              <th className="p-2 text-right text-sm font-medium text-gray-700">Value</th>
              <th className="p-2 text-center text-sm font-medium text-gray-700">Unit</th>
              <th className="p-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    className="w-full p-1 border-none rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    className="w-full p-1 border-none rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                  />
                </td>
                <td className="p-1">
                  <select
                    value={row.unit}
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                    className="w-full p-1 border-none rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent"
                  >
                    <option value="in">in</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                    <option value="ft">ft</option>
                    <option value="m">m</option>
                  </select>
                </td>
                <td className="p-1 text-center">
                  <button
                    onClick={() => removeRow(index)}
                    disabled={rows.length <= 1}
                    className={`p-1 rounded-full ${
                      rows.length <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                    }`}
                    title="Remove row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableEditor;