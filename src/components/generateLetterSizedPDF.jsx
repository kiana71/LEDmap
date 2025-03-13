import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const generateLetterPDF = async () => {
  const contentElement = document.getElementById('pdf-content'); // Or use a ref
  
  // Create a jsPDF instance with Letter size
  const doc = new jsPDF({
    orientation: "landscape", // Change to "portrait" if needed
    unit: "in",
    format: "letter" // US Letter size
  });
  
  // Convert the React component to a canvas
  const canvas = await html2canvas(contentElement, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    width: contentElement.offsetWidth,
    height: contentElement.offsetHeight
  });
  
  // Calculate the proper sizing to fit content to page
  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
  // Add the image to fill the page exactly
  doc.addImage(imgData, 'JPEG', 0, 0, 11, 8.5); // Letter size in landscape: 11 x 8.5 inches
  
  // Save the PDF
  doc.save("form.pdf");
};