import "./App.css";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { useState } from "react";
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
  
  // PDF generation function to pass to Canvas
  const generatePDF = (element) => {
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: 'led_display_diagram.pdf',
      image: { type: 'png', quality: 1.0 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'landscape'
      }
    };
    
    html2pdf()
      .set(opt)
      .from(element)
      .save();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App">
      <VisibilityProvider>
      <ErrorBoundary FallbackComponent={Fallback}>
        <ToolbarProvider>
          <Canvas 
            isPDFMode={isPDFMode}
            generatePDF={generatePDF}
          />
        </ToolbarProvider>
        <Sidebar 
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          generatePDF={generatePDF}
        />
        <Header toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </ErrorBoundary>
      </VisibilityProvider>
    </div>
  );
}

export default App;