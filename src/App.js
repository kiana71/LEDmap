import "./App.css";
import "./print.css"; // Make sure you have the print.css file imported
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { useState, useRef } from "react";
import { ToolbarProvider } from "./hook/ToolbarContext";
import { usePDFStore } from "./zustand/usePDFStore";
import Canvas from "./components/Canvas";
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { VisibilityProvider } from "./components/toggleMenu";

function App() {
  const {isPDFMode, setPDFMode} = usePDFStore();
  
  //sidebar menu state
  const [isOpen, setIsOpen] = useState(false);
  
  // Create ref for the target element
  const targetRef = useRef(null);
  
  // PDF generation function using html2pdf
  const generatePDF = () => {
    const element = targetRef.current;
    
    if (!element) {
      console.error("Target element not found");
      return;
    }
    
    // Set PDF to processing mode
    setPDFMode(true);
    
    // Store original styles before making any changes
    const originalStyles = {
      transform: element.style.transform || '',
      position: element.style.position || '',
      width: element.style.width || '',
      height: element.style.height || '',
      margin: element.style.margin || '',
      padding: element.style.padding || '',
      top: element.style.top || '',
      left: element.style.left || '',
      overflow: element.style.overflow || ''
    };
    
    // Fix bottom row containers before generating PDF
    const bottomRow = element.querySelector('.flex.space-x-6.h-48') || element.querySelector('.flex.space-x-6.h-40');
    let bottomRowStyles = {};
    
    if (bottomRow) {
      // Store original styles
      bottomRowStyles.bottomRowStyle = bottomRow.getAttribute('style') || '';
      bottomRowStyles.noteContainerStyle = bottomRow.children[0]?.getAttribute('style') || '';
      bottomRowStyles.infoContainerStyle = bottomRow.children[1]?.getAttribute('style') || '';
      
      // Fix bottom row with explicit styles
      bottomRow.style.height = '180px';
      bottomRow.style.maxHeight = '180px';
      bottomRow.style.minHeight = '180px';
      bottomRow.style.display = 'flex';
      bottomRow.style.flexDirection = 'row';
      bottomRow.style.margin = '0';
      bottomRow.style.padding = '0';
      bottomRow.style.width = '100%';
      bottomRow.style.gap = '24px';
      bottomRow.style.position = 'relative';
      bottomRow.style.bottom = '0';
      
      // Fix note container
      if (bottomRow.children[0]) {
        const noteContainer = bottomRow.children[0];
        noteContainer.style.width = '48%';
        noteContainer.style.border = '2px solid #000';
        noteContainer.style.overflow = 'hidden';
        noteContainer.style.height = '180px';
        noteContainer.style.boxSizing = 'border-box';
        noteContainer.style.margin = '0';
        noteContainer.style.padding = '2px';
      }
      
      // Fix info container
      if (bottomRow.children[1]) {
        const infoContainer = bottomRow.children[1];
        infoContainer.style.width = '48%';
        infoContainer.style.border = '2px solid #000';
        infoContainer.style.overflow = 'hidden';
        infoContainer.style.height = '180px';
        infoContainer.style.boxSizing = 'border-box';
        infoContainer.style.margin = '0';
        infoContainer.style.padding = '0';
      }
    }
    
    // Add a class for print-specific CSS
    element.classList.add('generating-pdf');
    
    // Apply print-friendly styling with absolute positioning
    element.style.transform = 'none';
    element.style.transformOrigin = 'top left';
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.margin = '0';
    element.style.padding = '0';
    element.style.width = '1056px'; // Explicit pixel dimensions
    element.style.height = '816px';  // Explicit pixel dimensions
    element.style.overflow = 'hidden';
    element.style.boxSizing = 'border-box';
    
    // Calculate scale needed for 300 DPI (standard screen is 96 DPI)
    const DPI_SCALE = 300 / 96;
    
    // Add debugging borders if needed
    // Add this line to enable debug mode
    const DEBUG_MODE = false;
    
    if (DEBUG_MODE) {
      const allElements = element.querySelectorAll('*');
      allElements.forEach((el, index) => {
        const originalBorder = el.style.border;
        el.setAttribute('data-original-border', originalBorder);
        el.style.border = `1px solid ${index % 3 === 0 ? 'red' : index % 3 === 1 ? 'blue' : 'green'}`;
        el.setAttribute('data-debug-id', index);
      });
    }

    // Function to reset all styles
    function resetStyles() {
      // Clear debug borders if they were added
      if (DEBUG_MODE) {
        const allElements = element.querySelectorAll('[data-debug-id]');
        allElements.forEach(el => {
          const originalBorder = el.getAttribute('data-original-border');
          el.style.border = originalBorder || '';
          el.removeAttribute('data-debug-id');
          el.removeAttribute('data-original-border');
        });
      }
      
      // Restore original styles to the main element
      Object.entries(originalStyles).forEach(([key, value]) => {
        element.style[key] = value;
      });
      
      // Remove PDF generation class
      element.classList.remove('generating-pdf');
      
      // Restore bottom row styles
      if (bottomRow) {
        bottomRow.setAttribute('style', bottomRowStyles.bottomRowStyle);
        
        if (bottomRow.children[0]) {
          bottomRow.children[0].setAttribute('style', bottomRowStyles.noteContainerStyle);
        }
        
        if (bottomRow.children[1]) {
          bottomRow.children[1].setAttribute('style', bottomRowStyles.infoContainerStyle);
        }
      }
      
      // Reset PDF mode
      setPDFMode(false);
    }

    // Fallback function (not a hook, just a regular function)
    function html2pdfFallback() {
      const opt = {
        margin: [0, 0, 0, 0], // Explicit zero margins on all sides
        filename: 'led_display_diagram.pdf',
        image: { type: 'png', quality: 1.0 },
        html2canvas: { 
          scale: DPI_SCALE,
          dpi: 300,
          useCORS: true,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          width: 1056, // Explicit width
          height: 816, // Explicit height
          x: 0,
          y: 0,
          backgroundColor: '#FFFFFF',
          allowTaint: true,
          logging: true,
          onclone: function(clonedDoc) {
            // Get the cloned target element
            const clonedElement = clonedDoc.querySelector('.generating-pdf');
            if (clonedElement) {
              // Force absolute positioning and explicit dimensions
              clonedElement.style.position = 'absolute';
              clonedElement.style.top = '0';
              clonedElement.style.left = '0';
              clonedElement.style.margin = '0';
              clonedElement.style.padding = '0';
              clonedElement.style.width = '1056px';
              clonedElement.style.height = '816px';
              clonedElement.style.overflow = 'hidden';
              clonedElement.style.boxSizing = 'border-box';
              
              // Fix dimension boxes container
              const dimensionContainer = clonedElement.querySelector('.pdf-dimension-container');
              if (dimensionContainer) {
                dimensionContainer.style.position = 'absolute';
                dimensionContainer.style.right = '20px';
                dimensionContainer.style.top = '50px';
                dimensionContainer.style.width = '280px';
                dimensionContainer.style.maxWidth = '280px';
                dimensionContainer.style.zIndex = '10';
                
                // Make sure dimension boxes are visible
                const dimensionBoxes = dimensionContainer.querySelectorAll('.dimension-box');
                dimensionBoxes.forEach(box => {
                  box.style.backgroundColor = '#ffffff';
                  box.style.opacity = '1';
                  box.style.border = '2px solid black';
                  box.style.padding = '8px';
                  box.style.margin = '0 0 16px 0';
                  box.style.width = '100%';
                  box.style.boxSizing = 'border-box';
                });
              }
              
              // Fix bottom row specifically
              const bottomRow = clonedElement.querySelector('.flex.space-x-6.h-48') || 
                                clonedElement.querySelector('.flex.space-x-6.h-40');
              if (bottomRow) {
                // Force explicit styling
                bottomRow.style.display = 'flex';
                bottomRow.style.flexDirection = 'row';
                bottomRow.style.justifyContent = 'space-between';
                bottomRow.style.height = '180px';
                bottomRow.style.marginTop = 'auto';
                bottomRow.style.marginBottom = '0';
                bottomRow.style.marginLeft = '0';
                bottomRow.style.marginRight = '0';
                bottomRow.style.paddingBottom = '0';
                bottomRow.style.width = '100%';
                bottomRow.style.boxSizing = 'border-box';
                bottomRow.style.position = 'absolute';
                bottomRow.style.bottom = '0';
                bottomRow.style.left = '0';
                
                // Fix the direct children (notes and info sections)
                Array.from(bottomRow.children).forEach((child, index) => {
                  child.style.flex = '1';
                  child.style.border = '2px solid black';
                  child.style.height = '180px';
                  child.style.margin = '0';
                  child.style.padding = index === 0 ? '2px' : '0';
                  child.style.boxSizing = 'border-box';
                  child.style.overflow = 'hidden';
                });
              }
            }
          }
        },
        jsPDF: { 
          unit: 'in',
          format: [11, 8.5], // Letter size in inches (landscape)
          orientation: 'landscape',
          compress: true,
          precision: 16,
          hotfixes: ['px_scaling'],
          putOnlyUsedFonts: true,
          floatPrecision: 16,
          // Explicit margin settings
          margins: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        }
      };
      
      // Generate the PDF
      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .output('save', 'led_display_diagram.pdf')
        .then(() => {
          resetStyles();
        })
        .catch(error => {
          console.error("PDF generation error:", error);
          resetStyles();
        });
    }

    // Try a completely different approach using html2canvas directly first
    html2canvas(element, {
      scale: DPI_SCALE,
      useCORS: true,
      allowTaint: true,
      logging: true,
      letterRendering: true,
      backgroundColor: '#FFFFFF',
      width: 1056,
      height: 816,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1056,
      windowHeight: 816,
      // Special handling for dimension tables
      onclone: function(clonedDoc) {
        // Fix dimension boxes positioning in the clone
        const clonedElement = clonedDoc.querySelector('.generating-pdf');
        if (clonedElement) {
          // Make sure the container is properly sized
          clonedElement.style.width = '1056px';
          clonedElement.style.height = '816px';
          clonedElement.style.position = 'relative';
          clonedElement.style.overflow = 'hidden';
          
          // Find and fix dimensions container
          const dimensionContainer = clonedElement.querySelector('.pdf-dimension-container');
          if (dimensionContainer) {
            // Force absolute positioning
            dimensionContainer.style.position = 'absolute';
            dimensionContainer.style.right = '20px';
            dimensionContainer.style.top = '50px';
            dimensionContainer.style.width = '280px';
            dimensionContainer.style.maxWidth = '280px';
            dimensionContainer.style.zIndex = '10';
            
            // Make sure dimension boxes are visible
            const dimensionBoxes = dimensionContainer.querySelectorAll('.dimension-box');
            dimensionBoxes.forEach(box => {
              box.style.backgroundColor = '#ffffff';
              box.style.opacity = '1';
              box.style.border = '2px solid black';
              box.style.padding = '8px';
              box.style.margin = '0 0 16px 0';
              box.style.width = '100%';
              box.style.boxSizing = 'border-box';
            });
          }
          
          // Fix bottom row specifically
          const bottomRow = clonedElement.querySelector('.flex.space-x-6.h-48') || 
                            clonedElement.querySelector('.flex.space-x-6.h-40');
          if (bottomRow) {
            // Force explicit styling
            bottomRow.style.display = 'flex';
            bottomRow.style.flexDirection = 'row';
            bottomRow.style.height = '180px';
            bottomRow.style.margin = '0';
            bottomRow.style.padding = '0';
            bottomRow.style.width = '100%';
            bottomRow.style.position = 'absolute';
            bottomRow.style.bottom = '0';
            bottomRow.style.left = '0';
            
            // Fix direct children
            Array.from(bottomRow.children).forEach((child, index) => {
              child.style.flex = '1';
              child.style.border = '2px solid black';
              child.style.height = '180px';
              child.style.margin = '0';
              child.style.padding = index === 0 ? '2px' : '0';
              child.style.boxSizing = 'border-box';
            });
          }
        }
      }
    }).then(canvas => {
      // Create PDF with jsPDF directly
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: 'letter',
        compress: true,
        hotfixes: ['px_scaling']
      });
      
      // Add image to PDF with explicit zero margins
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 11, 8.5);
      
      // Save the PDF file
      pdf.save('led_display_diagram.pdf');
      
      // Cleanup and reset everything
      resetStyles();
    }).catch(error => {
      console.error("Canvas generation error:", error);
      
      // Fallback to html2pdf if canvas method fails
      console.log("Falling back to html2pdf method");
      html2pdfFallback();
    });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App">
      <VisibilityProvider>
      <ErrorBoundary FallbackComponent={Fallback}>
        <ToolbarProvider>
          <Canvas targetRef={targetRef} isPDFMode={isPDFMode} />
        </ToolbarProvider>
        <Sidebar 
          generatePDF={generatePDF} 
          targetRef={targetRef} 
          isOpen={isOpen} 
          toggleSidebar={toggleSidebar}
        />
        <Header toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </ErrorBoundary>
      </VisibilityProvider>
    </div>
  );
}

export default App;