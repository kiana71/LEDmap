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
import "./print.css";
import { VisibilityProvider } from "./components/toggleMenu";
import { toggleClassOnTableInputs } from "./utils/printUtils";
import C2S from "./utils/canvas2svg";
import useApiStore from "./store/apiStore";
import Modal from "./components/Modal";

import PrintPreviewButton from './components/PrintPreviewButton';

function App() {
  const containerRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const { showDeleteModal, drawingToDelete, confirmDelete, cancelDelete } =
    useApiStore();

  // Add keyboard shortcut handler for browser's native print preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        // Let the browser handle the native print preview
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const exportToPDF = async () => {
    try {
      setIsPrinting(true);
      const bc = document.getElementById("bottom_container");

      // Apply print-specific styles
      toggleClassOnTableInputs("table_input", "bottom-3", true);
      toggleClassOnTableInputs("table_input_td", "pb-3", true);
      toggleClassOnTableInputs("p_print", "pb-3", true);
      bc.classList.remove("h-40");
      bc.classList.add("h-64");
      bc.classList.remove("mb-1");
      bc.classList.add("mb-3");
      containerRef.current.classList.add("pb-8");

      if (!containerRef.current) {
        throw new Error("Container element not found");
      }

      // Get container dimensions
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      // Configure for high quality
      const scale = 2;
      const dpi = 300;

      const canvas = await html2canvas(containerRef.current, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: containerWidth,
        height: containerHeight,
        windowWidth: containerWidth * scale,
        windowHeight: containerHeight * scale,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Convert pixels to mm
      const pxToMm = 0.264583333;
      const widthMm = containerWidth * scale * pxToMm;
      const heightMm = containerHeight * scale * pxToMm;

      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
        compress: true,
        precision: 4,
      });

      pdf.setProperties({
        title: "Technical Drawing",
        creator: "SignCast Technical Map",
        printQuality: dpi,
      });

      pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm, "", "FAST");
      //ye lahze push begiram..
      // Generate filename with timestamp and download
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      pdf.save(`technical-drawing-${timestamp}.pdf`);
      // khob che konam?
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Reset styles
      const bc = document.getElementById("bottom_container");
      if (bc) {
        toggleClassOnTableInputs("table_input", "bottom-3", false);
        toggleClassOnTableInputs("table_input_td", "pb-3", false);
        toggleClassOnTableInputs("p_print", "pb-3", false);
        bc.classList.remove("h-64");
        bc.classList.add("h-40");
        bc.classList.remove("mb-3");
        bc.classList.add("mb-1");
        containerRef.current.classList.remove("pb-8");
      }
      setIsPrinting(false);
    }
  };

  //sidebar menu state
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <ErrorBoundary fallback={<Fallback />}>
      <ToolbarProvider>
        <VisibilityProvider>
          <div className="flex h-screen">
            <Sidebar exportToPDF={exportToPDF}/>
            <div className="flex-1 flex flex-col">
              <Header />
              <div className="flex-1 overflow-auto relative">
                <div className="fixed top-32 left-4 z-50">
                  <PrintPreviewButton 
                    containerRef={containerRef} 
                    toggleClassOnTableInputs={toggleClassOnTableInputs} 
                  />
                </div>
                <Canvas containerRef={containerRef} />
              </div>
            </div>
          </div>
          {showDeleteModal && (
            <Modal
              isOpen={showDeleteModal}
              onClose={cancelDelete}
              title="Delete Drawing"
              actions={
                <>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    onClick={confirmDelete}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                </>
              }
            >
              <p>
                Are you sure you want to delete Drawing "{drawingToDelete}"? This
                action cannot be undone.
              </p>
            </Modal>
          )}
        </VisibilityProvider>
      </ToolbarProvider>
    </ErrorBoundary>
  );
}

export default App;
