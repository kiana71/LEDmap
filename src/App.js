import "./App.css";
import Content from "./components/Content";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { Margin, usePDF } from "react-to-pdf";
import { useState } from "react";
import { ToolbarProvider } from "./hook/ToolbarContext";
import { usePDFStore } from "./zustand/usePDFStore";
import Canvas from "./components/Canvas";

function App() {
  const {isPDFMode, setPDFMode} = usePDFStore();
  //sidebar menu state
  const [isOpen, setIsOpen] = useState(false);
  //sidebar menu function
  const { toPDF, targetRef } = usePDF({
    filename: "form.pdf",
    page: { 
      width: 11 * 72, // Letter width in points (landscape)
      height: 8.5 * 72, // Letter height in points (landscape)
      margin: Margin.SMALL, 
      orientation: "landscape",
    },
  });
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="App">
        <ErrorBoundary FallbackComponent={Fallback}>
          <div ref={targetRef}>
            <ToolbarProvider>
            <Canvas toPDF={toPDF} targetRef={targetRef} isPDFMode={isPDFMode}/>
            </ToolbarProvider>
            </div>
            <Sidebar toPDF={toPDF} targetRef={targetRef} isOpen={isOpen} toggleSidebar={toggleSidebar}/>
        
          <Header toggleSidebar={toggleSidebar} isOpen={isOpen}/>
          {/* Removed the fixed ExternalToolbar */}
        </ErrorBoundary>
 
    </div>
  );
}

export default App;