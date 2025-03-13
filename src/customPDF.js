// Create a file called customPDF.js
import { usePDF as originalUsePDF, Margin } from "react-to-pdf";
import { useRef } from 'react';

export const useLetterPDF = (options = {}) => {
  // Create a merged options object that forces Letter format
  const letterOptions = {
    ...options,
    page: {
      format: "letter",
      orientation: "landscape",
      margin: options.page?.margin || Margin.SMALL,
      ...options.page,
    },
    overrides: {
      ...options.overrides,
      pdf: {
        format: "letter",
        orientation: "landscape",
        ...options.overrides?.pdf,
      },
    },
  };

  // Use the original hook with our modified options
  return originalUsePDF(letterOptions);
};

export { Margin };