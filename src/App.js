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
import PreviewIcon from '@mui/icons-material/Preview';

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

  const handlePrintPreview = async () => {
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

      // Create a new window for preview
      const previewWindow = window.open('', '_blank');
      
      // Add key stylesheets directly - more reliable than trying to extract all rules
      const cssLinks = [
        '/index.css',  // Assuming main CSS is here - adjust path as needed
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', // Common font
      ];
      
      // Create basic HTML structure for the preview
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Technical Drawing</title>
            ${cssLinks.map(link => `<link rel="stylesheet" href="${link}">`).join('')}
            <style>
              /* Essential styles for the preview */
              body {
                margin: 0;
                padding: 20px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              }
              
              /* Container styles */
              .preview-container {
                width: 816px;
                height: 1056px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
              }
              
              /* Button area */
              .btn-container {
                text-align: center;
                margin: 20px 0;
              }
              
              .btn {
                padding: 8px 16px;
                background-color: #4a90e2;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                margin: 0 10px;
              }
              
              .btn:hover {
                background-color: #3a80d2;
              }
              
              /* Make SVG properly sized */
              svg {
                max-width: 100%;
                height: auto;
              }
              
              /* Make notes content selectable */
              [contenteditable="true"] {
                -webkit-user-select: text;
                user-select: text;
              }
              
              /* Table styles */
              table {
                width: 100%;
                border-collapse: collapse;
              }
              
              td, th {
                border: 1px solid #ddd;
                padding: 8px;
              }
              
              /* Print-specific styles */
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                
                .preview-container {
                  box-shadow: none;
                  padding: 0;
                  width: 100%;
                  height: auto;
                }
                
                .btn-container {
                  display: none;
                }
                
                .preview-content * {
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="btn-container">
              <button class="btn" id="printBtn">Print Document</button>
              <button class="btn" id="saveAsPdfBtn">Save as PDF</button>
            </div>
            <div class="preview-container">
              <div class="preview-content">
                <!-- Content will be injected here by script -->
              </div>
            </div>
            
            <script>
              // Handle the print button
              document.getElementById('printBtn').addEventListener('click', function() {
                window.print();
              });
              
              // Handle save as PDF button - uses browser's built-in print-to-PDF
              document.getElementById('saveAsPdfBtn').addEventListener('click', function() {
                // Hide buttons for cleaner PDF
                document.querySelector('.btn-container').style.display = 'none';
                
                // Use timeout to allow DOM update before printing
                setTimeout(function() {
                  window.print();
                  
                  // Show buttons again after print dialog
                  setTimeout(function() {
                    document.querySelector('.btn-container').style.display = 'block';
                  }, 1000);
                }, 100);
              });
            </script>
          </body>
        </html>
      `);
      
      // Get the container where we'll inject content
      const contentContainer = previewWindow.document.querySelector('.preview-content');
      
      // Create a clone of the original content
      const contentClone = containerRef.current.cloneNode(true);
      
      // Fix SVG viewBox issues that can happen during cloning
      const svgElements = contentClone.querySelectorAll('svg');
      svgElements.forEach(svg => {
        // Ensure viewBox is properly set to preserve aspect ratio
        if (!svg.getAttribute('viewBox') && svg.width && svg.height) {
          svg.setAttribute('viewBox', `0 0 ${svg.width.baseVal.value} ${svg.height.baseVal.value}`);
        }
        
        // Set preserveAspectRatio to ensure proper scaling
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Make sure SVGs have proper dimensions
        svg.style.width = '100%';
        svg.style.height = 'auto';
      });
      
      // Make content selectable
      const allElements = contentClone.querySelectorAll('*');
      allElements.forEach(el => {
        // Make text selectable
        el.style.userSelect = 'text';
        el.style.webkitUserSelect = 'text';
        
        // Fix any position:absolute that might cause layout issues
        if (window.getComputedStyle(el).position === 'absolute') {
          el.style.position = 'relative';
        }
      });
      
      // Make sure form elements are interactive
      const formElements = contentClone.querySelectorAll('input, textarea, [contenteditable="true"]');
      formElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        
        // If it's a contenteditable element, make sure it remains editable
        if (el.hasAttribute('contenteditable')) {
          el.setAttribute('contenteditable', 'true');
        }
      });
      
      // Fix table spacing issues
      const tableCells = contentClone.querySelectorAll('td');
      tableCells.forEach(cell => {
        cell.style.paddingBottom = '0';
      });
      
      // Fix table input positioning
      const tableInputs = contentClone.querySelectorAll('.table_input');
      tableInputs.forEach(input => {
        input.style.marginBottom = '0';
        input.style.bottom = '0';
      });
      
      // Remove any transform scaling that might break layout
      contentClone.style.transform = 'none';
      contentClone.style.position = 'static';
      contentClone.style.top = 'auto';
      contentClone.style.left = 'auto';
      
      // Adjust size for print
      contentClone.style.width = '100%';
      contentClone.style.height = 'auto';
      contentClone.style.padding = '0';
      
      // Add the cloned content to the preview window
      contentContainer.appendChild(contentClone);
      
      // Close the document to finish loading
      previewWindow.document.close();

    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Error creating preview: " + error.message);
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
                  <button
                    onClick={handlePrintPreview}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                  >
                    <PreviewIcon />
                    Preview
                  </button>
                </div>
                <Canvas containerRef={containerRef} />
              </div>
            </div>
          </div>
          {showDeleteModal && (
            <Modal
              title="Delete Drawing"
              message={`Are you sure you want to delete "${drawingToDelete?.name}"?`}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          )}
        </VisibilityProvider>
      </ToolbarProvider>
    </ErrorBoundary>
  );
}

export default App;
