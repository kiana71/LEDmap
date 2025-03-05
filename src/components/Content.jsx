import React, { forwardRef } from 'react';
import DiagramLED from './DiagramLED';
import DimensionBoxes from './Dimension';
import ToggleOptionsMenu, { VisibilityProvider } from './toggleMenu';

const Content = ({ toPDF, targetRef }) => {
  return (
    <VisibilityProvider>
      <section className="overflow-y-auto w-full h-full pt-14 lg:pr-80 pr-0 top-0">
        <div className="w-full p-2 h-full">
          <div ref={targetRef} className="grid grid-cols-1 lg:grid-cols-12 gap-1 h-full overflow-y-hidden border">
          <div className="col-span-12 lg:col-span-7 flex items-center justify-center">
              <DiagramLED />
            </div>
            <div className="col-span-12 lg:col-span-5 flex flex-col items-start">
              <DimensionBoxes />
            </div>
            
          </div>
        </div>
      </section>
    </VisibilityProvider>
  );
};

export default Content;