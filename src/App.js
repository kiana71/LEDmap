import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { useState } from "react";
import { ToolbarProvider } from "./hook/ToolbarContext";
import Canvas from "./components/Canvas";
import html2pdf from 'html2pdf.js';
import './print.css';
import { VisibilityProvider } from "./components/toggleMenu";

function App() {

  
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
            // isPDFMode={isPDFMode}
            // generatePDF={generatePDF}
          />
        </ToolbarProvider>
        <Sidebar 
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          // generatePDF={generatePDF}
        />
        <Header toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </ErrorBoundary>
      </VisibilityProvider>
    </div>
  );
}

export default App;