import "./App.css";
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
import './print.css';
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
    
    // Set PDF to processing mode if you have a UI indicator
    setPDFMode(true);
    
    // Fix bottom row containers before generating PDF
    const bottomRow = element.querySelector('.flex.space-x-6.h-48');
    let originalStyles = {};
    
    if (bottomRow) {
      // Store original styles
      originalStyles.bottomRowStyle = bottomRow.getAttribute('style') || '';
      originalStyles.noteContainerStyle = bottomRow.children[0]?.getAttribute('style') || '';
      originalStyles.infoContainerStyle = bottomRow.children[1]?.getAttribute('style') || '';
      
      // Fix bottom row
      bottomRow.style.height = '180px';
      bottomRow.style.maxHeight = '180px';
      bottomRow.style.minHeight = '180px';
      bottomRow.style.display = 'flex';
      bottomRow.style.flexDirection = 'row';
      bottomRow.style.marginBottom = '0';
      bottomRow.style.width = '100%';
      bottomRow.style.gap = '24px';
      bottomRow.style.padding = '0';
      
      // Fix note container
      if (bottomRow.children[0]) {
        const noteContainer = bottomRow.children[0];
        noteContainer.style.width = '48%';
        noteContainer.style.border = '2px solid #000';
        noteContainer.style.overflow = 'hidden';
        noteContainer.style.height = '180px';
        noteContainer.style.boxSizing = 'border-box';
        noteContainer.style.margin = '0';
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
      }
    }
    
    // Add a class for print-specific CSS
    element.classList.add('generating-pdf');
    
    // Store original styles
    const originalTransform = element.style.transform;
    const originalPosition = element.style.position;
    
    // Apply print-friendly styling
    element.style.transform = 'scale(0.86)';
    element.style.transformOrigin = 'top center';
    element.style.position = 'static';
    element.style.margin = '0';
    element.style.padding = '0';
    
    const opt = {
      margin: 0,
      padding: 0,
      filename: 'led_display_diagram.pdf',
      image: { type: 'jpeg', quality: 0.1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        width: element.offsetWidth,
        height: element.offsetHeight,
        x: 0,
        y: 0
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'landscape',
        compress: true,
        precision: 16
      }
    };
    
    // Generate the PDF
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Clean up styles
        resetStyles();
      })
      .catch(error => {
        console.error("PDF generation error:", error);
        // Clean up styles even on error
        resetStyles();
      });
    
    // Function to reset all styles
    function resetStyles() {
      // Restore original styles
      element.style.transform = originalTransform;
      element.style.position = originalPosition;
      element.style.margin = '';
      element.style.padding = '';
      
      // Remove PDF generation class
      element.classList.remove('generating-pdf');
      
      // Restore bottom row styles
      if (bottomRow) {
        bottomRow.setAttribute('style', originalStyles.bottomRowStyle);
        
        if (bottomRow.children[0]) {
          bottomRow.children[0].setAttribute('style', originalStyles.noteContainerStyle);
        }
        
        if (bottomRow.children[1]) {
          bottomRow.children[1].setAttribute('style', originalStyles.infoContainerStyle);
        }
      }
      
      // Reset PDF mode
      setPDFMode(false);
    }
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