import React, { useState, useEffect, useRef } from 'react';
import DiagramLED from './DiagramLED';
import DimensionBoxes from './Dimension';
import { ToolbarProvider } from "../hook/ToolbarContext";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useSheetDataStore } from '../zustand/sheetDataStore';

const Content = ({ toPDF, targetRef }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.7);
  const { isEditMode } = useSheetDataStore();
  
  // The dimensions you originally specified were 8.5 x 11.5 inches
  // Adjusting to match that ratio more precisely (landscape orientation)
  const contentWidth = 1380; // 11.5 inches at 120 DPI
  const contentHeight = 1020; // 8.5 inches at 120 DPI
  
  // Calculate the appropriate scale based on container size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateScale = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Account for padding and the sidebar
      const availableWidth = containerWidth - 40;
      const availableHeight = containerHeight - 40;
      
      // Calculate scale to fit within container while maintaining aspect ratio
      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;
      
      // Use the minimum scale to ensure the entire content fits
      const newScale = Math.min(scaleX, scaleY) * 0.85;
      
      setScale(newScale);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Rerun when switching modes
    const checkSizeInterval = setInterval(updateScale, 500);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      clearInterval(checkSizeInterval);
    };
  }, [isEditMode]);

  // For Edit Mode - static version that allows typing
  if (isEditMode) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-screen pt-14 lg:pr-80 pr-0 relative overflow-hidden"
        style={{ background: 'white' }}
      >
        <div className="flex justify-center items-center w-full h-full">
          <div 
            style={{
              width: `${contentWidth}px`,
              height: `${contentHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              ref={targetRef}
              className="grid grid-cols-1 lg:grid-cols-12 h-full w-full"
            >
              <div className="col-span-12 md:col-span-6 flex items-center justify-center">
                <ToolbarProvider>
                  <DiagramLED />
                </ToolbarProvider>
              </div>
              <div className="col-span-12 md:col-span-6 flex flex-col items-start">
                <DimensionBoxes />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For View Mode - with zoom and pan
  return (
    <div 
      ref={containerRef}
      className="w-full h-screen pt-14 lg:pr-80 pr-0 relative overflow-hidden"
      style={{ background: 'white' }}
    >
      <TransformWrapper
        initialScale={scale}
        minScale={0.1}
        maxScale={10}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        limitToBounds={false}
        centerOnInit={true}
        alignmentAnimation={{ disabled: true }}
        
        onInit={(ref) => {
          if (scale > 0) {
            setTimeout(() => {
              ref.setTransform(0, 0, scale);
            }, 150);
          }
        }}
      >
        {({ zoomIn, zoomOut, setTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-16 left-4 z-40 flex gap-2 bg-white rounded shadow">
              <button
                onClick={() => zoomIn(0.2)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
              <button
                onClick={() => zoomOut(0.2)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -
              </button>
              <button
                onClick={() => {
                  setTransform(0, 0, scale);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  const containerWidth = containerRef.current.offsetWidth;
                  const containerHeight = containerRef.current.offsetHeight;
                  
                  const fillScale = Math.max(
                    containerWidth / contentWidth,
                    containerHeight / contentHeight
                  ) * 1.01;
                  
                  setTransform(0, 0, fillScale);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Fill
              </button>
            </div>
            
            <TransformComponent
              wrapperClassName="w-full h-full flex justify-center items-center" 
              contentClassName="flex justify-center items-center"
              wrapperStyle={{ 
                width: '100%', 
                height: '100%',
                overflow: 'visible'
              }}
              contentStyle={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Fixed size container with correct aspect ratio */}
              <div 
                style={{
                  width: `${contentWidth}px`,
                  height: `${contentHeight}px`,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div
                  ref={targetRef}
                  className="grid grid-cols-1 lg:grid-cols-12 h-full w-full"
                >
                  <div className="col-span-12 md:col-span-6 flex items-center justify-center">
                    <ToolbarProvider>
                      <DiagramLED />
                    </ToolbarProvider>
                  </div>
                  <div className="col-span-12 md:col-span-6 flex flex-col items-start">
                    <DimensionBoxes />
                  </div>
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default Content;