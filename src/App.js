import "./App.css";
import React, { useEffect, useRef, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { ToolbarProvider } from "./hook/ToolbarContext";
import Canvas from "./components/Canvas";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import './print.css';
import { VisibilityProvider } from "./components/toggleMenu";
import { toggleClassOnTableInputs } from './utils/printUtils';

function App() {
 //pdf--------------------------====================
 const containerRef = useRef(null);

 const exportToPDF = async () => {
   const bc = document.getElementById("bottom_container");
   toggleClassOnTableInputs("table_input","bottom-3", true);
   toggleClassOnTableInputs("table_input_td","pb-3", true);
   toggleClassOnTableInputs("p_print", "pb-3", true);
   bc.classList.remove("h-40");
   bc.classList.add("h-64");
   bc.classList.remove("mb-1");
   bc.classList.add("mb-3");
   containerRef.current.classList.add("pb-8");

   if (!containerRef.current) return;

   // Configure for high quality
   const scale = 4; // Higher scale = better quality

   const canvas = await html2canvas(containerRef.current, {
     scale: scale,
     useCORS: true,
     logging: false,
     backgroundColor: "#f3f4f6", // Match your bg-gray-200
   });

   const imgData = canvas.toDataURL("image/jpeg", 1.0);

   // Create PDF with custom dimensions to match your element's aspect ratio
   // Convert pixels to mm (assuming 96 DPI)
   const pxToMm = 0.264583333;
   const widthMm = 3300 * pxToMm;
   const heightMm = 2550 * pxToMm;

   const pdf = new jsPDF({
     orientation: widthMm > heightMm ? "landscape" : "portrait",
     unit: "mm",
     format: [widthMm, heightMm],
     compress: true, // Optional: reduces file size
     precision: 4 
   });
// Optional: Set PDF print quality
   pdf.setProperties({
     title: 'High Resolution Print',
     creator: 'Your Application Name',
     printQuality: 300 // Explicitly set print quality
   });
   // Add image to perfectly fit the page
   pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm, "", "FAST");

   pdf.save("container-export.pdf");
   toggleClassOnTableInputs("table_input","bottom-3", false);
   toggleClassOnTableInputs("table_input_td","pb-3", false);
   toggleClassOnTableInputs("p_print", "pb-3", false);
   bc.classList.remove("h-64");
   bc.classList.add("h-40");
   bc.classList.remove("mb-3")
   containerRef.current.classList.remove("pb-8");
 };
 //pdf--------------------------====================
  
  //sidebar menu state
  const [isOpen, setIsOpen] = useState(false);
  
  // PDF generation function to pass to Canvas
  

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App">
      <VisibilityProvider>
      <ErrorBoundary FallbackComponent={Fallback}>
        <ToolbarProvider>
          <Canvas 
            containerRef={containerRef}
          />
        </ToolbarProvider>
        <Sidebar 
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          exportToPDF={exportToPDF}
        />
        <Header toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </ErrorBoundary>
      </VisibilityProvider>
    </div>
  );
}

export default App;