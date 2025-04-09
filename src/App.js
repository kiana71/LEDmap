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
import C2S from './utils/canvas2svg';

function App() {
  const containerRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Add keyboard shortcut handler for print preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintPreview();
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
      const previewWindow = window.open('', '_blank', 'width=1200,height=800');
      
      // First, let's manually include all link tags from the current document
      const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.outerHTML);
        
      // Get all style tags from the document
      const styleTags = Array.from(document.querySelectorAll('style'))
        .map(style => style.outerHTML);
      
      // Create basic HTML structure for the preview
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Technical Drawing</title>
            ${linkTags.join('\n')}
            ${styleTags.join('\n')}
            <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
            <style>
              /* Basic container styles */
              body {
                margin: 0;
                padding: 20px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
              
              .btn-container {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
                padding: 10px;
              }
              
              .btn {
                padding: 10px 20px;
                background-color: #4a90e2;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              
              .btn:hover {
                background-color: #3a80d2;
              }

              .btn-export {
                background-color: #10b981;
              }

              .btn-export:hover {
                background-color: #059669;
              }
              
              /* Container for the content */
              .preview-container {
                margin: 0 auto;
                width: fit-content;
              }
              
              /* Iframe styles */
              .content-iframe {
                border: none;
                width: 1056px;
                height: 816px;
                margin: 0 auto;
                display: block;
                background: white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              
              /* For the second (hidden) iframe used for printing */
              .print-iframe {
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 1056px;
                height: 816px;
                border: none;
              }
              
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                .btn-container, .preview-container {
                  display: none !important;
                }
                
                .print-container {
                  display: block !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                .print-iframe {
                  position: static !important;
                  width: 100% !important;
                  height: auto !important;
                  border: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="btn-container">
              <button class="btn" id="printBtn">Print Document</button>
              <button class="btn btn-export" id="svgBtn">Export SVG</button>
            </div>
            
            <!-- Main preview iframe -->
            <div class="preview-container">
              <iframe id="contentFrame" class="content-iframe" frameborder="0"></iframe>
            </div>
            
            <!-- Hidden container that becomes visible only when printing -->
            <div class="print-container" style="display: none;">
              <!-- This iframe is only used for printing purposes -->
              <iframe id="printFrame" class="print-iframe" frameborder="0"></iframe>
            </div>
            
            <script>
              // Handle print button
              document.getElementById('printBtn').addEventListener('click', function() {
                // Get the main iframe content
                const iframe = document.getElementById('contentFrame');
                const iframeContent = iframe.contentDocument.documentElement.outerHTML;
                
                // Setup the print iframe with the same content
                const printFrame = document.getElementById('printFrame');
                const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
                printDoc.open();
                printDoc.write(iframeContent);
                
                // Add additional print styles directly to the print iframe
                const printStyle = printDoc.createElement('style');
                printStyle.textContent = \`
                  @page { size: landscape; margin: 0; }
                  body { margin: 0 !important; padding: 0 !important; background: white !important; }
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  
                  /* Make all text selectable */
                  * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                  }
                  
                  #drawing-container {
                    transform: none !important;
                    position: static !important;
                    top: auto !important;
                    left: auto !important;
                    width: 100% !important;
                    margin: 0 auto !important;
                  }
                  
                  /* If there are any dialogs or UI elements in the iframe, hide them */
                  .dialog, .modal, .popup { display: none !important; }
                \`;
                printDoc.head.appendChild(printStyle);
                
                // Close the document and make print container visible for printing
                printDoc.close();
                
                // Wait a bit for the content to be fully loaded
                setTimeout(function() {
                  // Show the print container and hide the preview
                  document.querySelector('.preview-container').style.display = 'none';
                  document.querySelector('.print-container').style.display = 'block';
                  
                  // Trigger print
                  window.print();
                  
                  // After printing, revert back to preview mode
                  setTimeout(function() {
                    document.querySelector('.preview-container').style.display = 'block';
                    document.querySelector('.print-container').style.display = 'none';
                  }, 1000);
                }, 500);
              });
              
              // Handle SVG export button
              document.getElementById('svgBtn').addEventListener('click', async function() {
                const iframe = document.getElementById('contentFrame');
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const drawingContainer = iframeDoc.getElementById('drawing-container');
                
                if (drawingContainer) {
                  try {
                    // Create a canvas from the container
                    const canvas = await html2canvas(drawingContainer, {
                      scale: 2,
                      useCORS: true,
                      logging: false,
                      backgroundColor: "#ffffff"
                    });

                    // Get canvas dimensions
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;

                    // Create SVG element
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('width', canvasWidth);
                    svg.setAttribute('height', canvasHeight);
                    svg.setAttribute('viewBox', '0 0 ' + canvasWidth + ' ' + canvasHeight);
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                    // Create image element
                    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                    image.setAttribute('width', canvasWidth);
                    image.setAttribute('height', canvasHeight);
                    image.setAttribute('href', canvas.toDataURL('image/png'));

                    // Add image to SVG
                    svg.appendChild(image);

                    // Add styles to ensure text is selectable
                    const style = document.createElement('style');
                    style.textContent = \`
                      text {
                        user-select: text;
                        -webkit-user-select: text;
                        pointer-events: auto;
                      }
                      tspan {
                        user-select: text;
                        -webkit-user-select: text;
                        pointer-events: auto;
                      }
                      #drawing-container {
                        width: 100%;
                        height: 100%;
                      }
                      svg {
                        width: 100%;
                        height: 100%;
                      }
                    \`;
                    svg.appendChild(style);

                    // Get the SVG content
                    const svgData = new XMLSerializer().serializeToString(svg);

                    // Create a blob with the SVG data
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });

                    // Create a download link
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'drawing.svg';

                    // Trigger the download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (error) {
                    console.error('Error exporting to SVG:', error);
                    alert('Error exporting to SVG. Please try again.');
                  }
                } else {
                  console.error('Drawing container not found');
                }
              });
            </script>
          </body>
        </html>
      `);

      // Wait for preview window to be ready
      setTimeout(() => {
        try {
          // Get the iframe element
          const iframe = previewWindow.document.getElementById('contentFrame');
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          
          // Create a complete HTML document for the iframe with all necessary styles
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Drawing Content</title>
                ${linkTags.join('\n')}
                ${styleTags.join('\n')}
                <style>
                  /* Reset body styles */
                  body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    overflow: auto;
                  }
                  
                  /* Make all text selectable */
                  * {
                    user-select: text !important;
                    -webkit-user-select: text !important;
                  }
                  
                  /* Make form elements interactive */
                  input, textarea, [contenteditable="true"] {
                    pointer-events: auto !important;
                  }
                  
                  /* Fix container size and positioning */
                  #drawing-container {
                    transform: none !important;
                    position: static !important;
                    top: auto !important;
                    left: auto !important;
                    width: 1056px !important;
                    height: auto !important;
                    margin: 0 auto !important;
                  }
                  
                  /* Fix SVG size to be full size */
                  svg {
                    display: block;
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                  }
                  
                  /* Bottom section fixes */
                  #bottom_container {
                    height: auto !important;
                    min-height: 160px !important;
                  }
                  
                  @media print {
                    @page {
                      size: landscape;
                      margin: 0;
                    }
                    
                    body {
                      margin: 0 !important;
                      padding: 0 !important;
                      background: white !important;
                    }
                    
                    * {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    
                    #drawing-container {
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                  }
                </style>
              </head>
              <body>
                <div id="drawing-container">
                  ${containerRef.current.outerHTML}
                </div>
                <script>
                  // Run this after everything is loaded
                  window.onload = function() {
                    // Fix SVG viewBox and dimensions
                    document.querySelectorAll('svg').forEach(function(svg) {
                      // Get the viewBox
                      const viewBox = svg.getAttribute('viewBox');
                      
                      // Get original width/height if they exist
                      const originalWidth = svg.getAttribute('width');
                      const originalHeight = svg.getAttribute('height');
                      
                      // Remove width/height attributes to allow CSS to control sizing
                      svg.removeAttribute('width');
                      svg.removeAttribute('height');
                      
                      // Keep the viewBox to maintain aspect ratio
                      if (viewBox) {
                        svg.setAttribute('viewBox', viewBox);
                      }
                      
                      // Make the SVG full-size
                      svg.style.width = '100%';
                      svg.style.height = 'auto';
                      
                      // Set preserveAspectRatio for consistent rendering
                      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                      
                      // Remove any scaling transforms on the SVG itself
                      svg.style.transform = 'none';
                    });
                    
                    // Reset transform on container
                    const container = document.getElementById('drawing-container');
                    if (container) {
                      const mainContent = container.firstElementChild;
                      if (mainContent) {
                        mainContent.style.transform = 'none';
                        mainContent.style.position = 'static';
                        mainContent.style.top = 'auto';
                        mainContent.style.left = 'auto';
                      }
                    }
                    
                    // Enable text selection and form elements
                    document.querySelectorAll('*').forEach(function(el) {
                      el.style.userSelect = 'text';
                      el.style.webkitUserSelect = 'text';
                    });
                    
                    document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(function(el) {
                      el.style.pointerEvents = 'auto';
                      if (el.hasAttribute('contenteditable')) {
                        el.setAttribute('contenteditable', 'true');
                      }
                    });
                  };
                </script>
              </body>
            </html>
          `);
          iframeDoc.close();
          
        } catch (error) {
          console.error("Error setting up iframe:", error);
        }
      }, 200);
      
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
        windowHeight: containerHeight * scale
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Convert pixels to mm
      const pxToMm = 0.264583333;
      const widthMm = (containerWidth * scale) * pxToMm;
      const heightMm = (containerHeight * scale) * pxToMm;

      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
        compress: true,
        precision: 4
      });

      pdf.setProperties({
        title: 'Technical Drawing',
        creator: 'SignCast Technical Map',
        printQuality: dpi
      });

      pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm, "", "FAST");
//ye lahze push begiram..
      // Generate filename with timestamp and download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
          <div className="App">
            <Header />
            <div className="flex">
              <Sidebar exportToPDF={exportToPDF}/>
              <div className="flex-1">
                <Canvas containerRef={containerRef} />
              </div>
            </div>
          </div>
        </VisibilityProvider>
      </ToolbarProvider>
    </ErrorBoundary>
  );
}

export default App;