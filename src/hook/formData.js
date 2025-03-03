import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const useExcelData = (filePath) => {
  const [sheetData, setSheetData] = useState({
    sheet1: [],
    sheet2: [],
    sheet3: [],
    sheet4: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error("Failed to fetch the Excel file.");
        }
        const blob = await response.blob();

        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });

            // Extract data from the first 4 sheets
            const newSheetData = {};
            const maxSheets = Math.min(4, workbook.SheetNames.length);

            for (let i = 0; i < maxSheets; i++) {
              const sheetName = workbook.SheetNames[i];
              const worksheet = workbook.Sheets[sheetName];
              newSheetData[`sheet${i + 1}`] = XLSX.utils.sheet_to_json(worksheet);
            }

            setSheetData(newSheetData);
          } catch (err) {
            setError("Error parsing Excel file.");
          } finally {
            setLoading(false);
          }
        };

        fileReader.readAsArrayBuffer(blob);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExcelData();
  }, [filePath]);

  return { sheetData, loading, error };
};

export default useExcelData;
