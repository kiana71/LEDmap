import React, { forwardRef } from 'react';
import DiagramLED from './DiagramLED';
import DimensionBoxes from './Dimension';


const Content = ({ toPDF, targetRef }) => {
  return (
    
      <section className="overflow-y-auto w-full h-full pt-14 lg:pr-80 pr-0 top-0">
        <div className="w-full p-2 h-full">
          <div ref={targetRef} className="grid grid-cols-1 lg:grid-cols-12 gap-1 h-full overflow-y-hidden border">
          <div className="col-span-12 md:col-span-8 flex items-center justify-center">
              <DiagramLED />
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-col items-start">
              <DimensionBoxes />
            </div>
            
          </div>
        </div>
      </section>
  
  );
};

export default Content;