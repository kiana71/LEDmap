import React from 'react';
import PreviewIcon from '@mui/icons-material/Preview';

const PrintPreviewButton = ({ containerRef, toggleClassOnTableInputs }) => {
  const handlePrintPreview = async () => {
    try {
      const bc = document.getElementById("bottom_container");
      
      // Apply print-specific styles
      toggleClassOnTableInputs("table_input", "bottom-3", true);
      toggleClassOnTableInputs("table_input_td", "pb-3", true);
      toggleClassOnTableInputs("p_print", "pb-3", true);
      bc.classList.remove("h-40");
      bc.classList.add("h-64");
      bc.classList.remove("mb-1");
      bc.classList.add("mb-3");
      containerRef.current.classList.add("pb-8");

      if (!containerRef.current) {
        throw new Error("Container element not found");
      }

      // Create a new window for preview
      const previewWindow = window.open('', '_blank');
      
      // Add key stylesheets directly
      const cssLinks = [
        '/index.css',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      ];
      
      // Create basic HTML structure for the preview
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Technical Drawing</title>
            ${cssLinks.map(link => `<link rel="stylesheet" href="${link}">`).join('')}
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
              }
              .v-logo{
                width: 150px;
                height: auto;
              }
              td, th {
                border: 1px solid #ddd;
                padding: 8px;
              }
              
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                
                .preview-container {
                  box-shadow: none;
                  padding: 0;
                  width: 1648px;
                  height: 1276px;
                }
                
                .btn-container {
                  display: none;
                }
                
                .preview-content * {
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="btn-container">
              <button class="btn" id="printBtn">Print Document</button>
              <button class="btn" id="saveAsPdfBtn">Save as PDF</button>
            </div>
            <div class="preview-container">
              <div class="preview-content">
                <!-- Content will be injected here by script -->
              </div>
            </div>
            
            <script>
              document.getElementById('printBtn').addEventListener('click', function() {
                window.print();
              });
              
              document.getElementById('saveAsPdfBtn').addEventListener('click', function() {
                document.querySelector('.btn-container').style.display = 'none';
                
                setTimeout(function() {
                  window.print();
                  
                  setTimeout(function() {
                    document.querySelector('.btn-container').style.display = 'block';
                  }, 1000);
                }, 100);
              });
            </script>
          </body>
        </html>
      `);
      
      const contentContainer = previewWindow.document.querySelector('.preview-content');
      const contentClone = containerRef.current.cloneNode(true);
      
      const svgElements = contentClone.querySelectorAll('svg');
      svgElements.forEach(svg => {
        if (!svg.getAttribute('viewBox') && svg.width && svg.height) {
          svg.setAttribute('viewBox', `0 0 ${svg.width.baseVal.value} ${svg.height.baseVal.value}`);
        }
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.width = '100%';
        svg.style.height = 'auto';
      });
      
      const allElements = contentClone.querySelectorAll('*');
      allElements.forEach(el => {
        el.style.userSelect = 'text';
        el.style.webkitUserSelect = 'text';
        
        if (window.getComputedStyle(el).position === 'absolute') {
          el.style.position = 'relative';
        }
      });
      
      const formElements = contentClone.querySelectorAll('input, textarea, [contenteditable="true"]');
      formElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        
        if (el.hasAttribute('contenteditable')) {
          el.setAttribute('contenteditable', 'true');
        }
      });
      
      const tableCells = contentClone.querySelectorAll('td');
      tableCells.forEach(cell => {
        cell.style.paddingBottom = '0';
      });
      
      const tableInputs = contentClone.querySelectorAll('.table_input');
      tableInputs.forEach(input => {
        input.style.marginBottom = '0';
        input.style.bottom = '0';
      });
      
      contentClone.style.transform = 'none';
      contentClone.style.position = 'static';
      contentClone.style.top = 'auto';
      contentClone.style.left = 'auto';
      contentClone.style.width = '100%';
      contentClone.style.height = 'auto';
      contentClone.style.padding = '0';
      
      contentContainer.appendChild(contentClone);
      previewWindow.document.close();

    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Error creating preview: " + error.message);
    } finally {
      const bc = document.getElementById("bottom_container");
      if (bc) {
        toggleClassOnTableInputs("table_input", "bottom-3", false);
        toggleClassOnTableInputs("table_input_td", "pb-3", false);
        toggleClassOnTableInputs("p_print", "pb-3", false);
        bc.classList.remove("h-64");
        bc.classList.add("h-40");
        bc.classList.remove("mb-3");
        bc.classList.add("mb-1");
        containerRef.current.classList.remove("pb-8");
      }
    }
  };

  return (
    <div className="fixed top-32 left-4 z-50">
      <button
        onClick={handlePrintPreview}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
      >
        <PreviewIcon />
        Preview
      </button>
    </div>
  );
};

export default PrintPreviewButton; 