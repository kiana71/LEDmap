import "./App.css";
import Content from "./components/Content";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ErrorBoundary from "./errorsManagement/ErrorBoundary";
import Fallback from "./errorsManagement/Fallback";
import { Margin, usePDF } from "react-to-pdf";
import { useState } from "react";
import  { VisibilityProvider } from './components/toggleMenu';
import { usePDFStore } from "./zustand/usePDFStore";


function App() {
  
const {isPDFMode , setPDFMode} = usePDFStore();
  //sidebar menu state
  const [isOpen, setIsOpen] = useState(false);
  //sidebar menu function


  const { toPDF, targetRef } = usePDF({
    filename: "form.pdf",
    page: { format: "A4", margin: Margin.SMALL, orientation: "landscape" },
  }); //important

  const toggleSidebar = ()=>{
    setIsOpen(!isOpen)
  }
  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={Fallback}>
      <VisibilityProvider>
        <Content toPDF={toPDF} targetRef={targetRef} isPdfMode={isPDFMode}/>
       
        <Sidebar toPDF={toPDF} targetRef={targetRef} isOpen={isOpen} toggleSidebar={toggleSidebar} />
        </VisibilityProvider>
        <Header toggleSidebar={toggleSidebar} isOpen={isOpen}/>
      </ErrorBoundary>
    </div>
  );
}

export default App;
