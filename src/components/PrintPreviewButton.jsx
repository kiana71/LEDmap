import React from "react";
import PreviewIcon from "@mui/icons-material/Preview";

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

      // Create a temporary print window
      const printWindow = window.open("", "_blank");

      // Add key stylesheets directly
      const cssLinks = [
        "/index.css",
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      ];

      // Create basic HTML structure for printing
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Technical Drawing</title>
            ${cssLinks
              .map((link) => `<link rel="stylesheet" href="${link}">`)
              .join("")}
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              }
              
              .v-logo{
                width: 120px;
                height: auto;
              }
              
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                
                .v-container {
                  width: 1648;
                  height: 1276;
                  box-shadow: none;
                  padding: 10px;
                }
                .v-upper-section{
                  display: flex;
                  flex-direction: row;
                  justify-content: space-between;
                }
                .btn-container {
                  display: none;
                }
                .v-bottom-row{
                  height: 200px;
                  display: flex;
                  flex-direction: row;
                  padding: 1rem;
                  justify-content: space-between;
                  gap: 1rem;
                }
                .v-container * {
                  break-inside: avoid;
                }
                .v-map-icon{
                  width:40px;
                }
                .v-info-table{
                  margin: 0 !important;
                  flex: 1 1 0%;
                  background-opacity: 0.3;
                }
                .v-upper-section-left{
                  width: 60%;
                }
                .v-dimension-boxes-container{
                  margin-right: 3rem;
                  display:flex;
                  flex-direction: row;
                  width: 16.666667%;
                  padding: 0.25rem;
                  padding-top:0;
                  max-width: 18rem;
                }
                .v-dimension-boxes{
                  width: 86%;
                  display:flex;
                  height: 350px;
                  justify-content: space-around;
                  flex-direction: column;
                  margin-top: 0.5rem;
                  margin-bottom: 0.5rem;
                }
                .v-dimension-box1, .v-dimension-box2{
                  padding: 1rem;
                 
                 
                  border: 2px solid #7b7a7a !important;
                  background-color: #ffffff;
                  background-opacity: 0.3;
                  width: 100%;
                  height: 7.5rem;
                }
               
                .v-dimension-group-title{
                  font-weight: 800;
                  color: #374151;
                  margin-bottom: 0.75rem;
                  margin-top: 0.25rem;
                  text-align: center;
                  font-size: 15px;
                }
                .v-dimension-item{
                  text-align: center;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                }
                .v-dimension-item-label{
                  display: flex;
                  justify-content: start;
                  text-align: center;
                  width: 50%;
                  align-items: center;
                  height: 100%;
                }
                .v-dimension-item-input{
                  text-align: end;
                  height: 1.75rem;
                  width: 50%;
                  border: none;
                }
                .v-notes-section{
                background-color: #fefefe;
                  flex: 1 1 0%;
                  border-width: 1px;
                  border-style: solid;
                  border-color: #ced3db;
                  background-opacity: 0.3;
                  padding-left: 1rem;
                  padding-bottom: 0;
                  padding-top: 0;
                }
                .v-info-table{
                  width: 100%;
                  user-select: text;
                  max-width: 500px;
                  font-size: 11px;
                  text-indent: 0;
                  table-layout: fixed !important;
                }    
                .v-info-table-input{
                  display: none;
                }
                .v-notes-section-title{
                  padding-top: 2px!important;
                  padding-bottom: 0!important;
                  margin-top: 2px!important;
                  margin-bottom: 1px!important;
                  left: 0.75rem;
                  top: 0px;
                  font-size: 1.125rem;
                  line-height: 1.75rem;
                  font-weight: 300;
                  text-decoration: underline;
                  margin-bottom: 0!important;
                  padding-bottom: 0!important;
                }
                .v-notes-editor{
                  top: -10px!important;
                  bottom: 0px!important;
                  padding-bottom: 0!important;
                  padding-top:0!important;
                }
                .v-info-table-container{
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  print:overflow-visible;
                }
                .v-info-table-container-inner{
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                  height: 100%;
                }
                .v-info-table-header{
                  background-color: #fbfafa;
                  font-weight: 300;
                  text-align: right;
                  font-size: 14px;
                  display: flex;
                  align-items: center !important;
                  align-content: center;
                  align-items: flex-start;
                  justify-content: space-between;
                //   border: solid 1px #d1d5db;
                //   border-bottom: none;
                
                  height: 44px;
                  padding-left: 1rem;
                  padding-right: 1rem;
                  padding-top: 0.5rem;
                  padding-bottom: 0.5rem;
                }
                .v-info-table td{
                  padding-top: 4px !important;
                  padding-bottom: 4px !important;
                  outline: 0.5px solid #d1d5db;
                  margin: 0 !important;
                  gap: 0 !important;
                  text-align: center;
                  align-items: center;
                  justify-content: center;
                }
                .v-map-icon-container{
                  display:flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  gap: 0.25rem;
                  padding-left: 0.4rem;
                  padding-right: 0.4rem;
                }
                .v-dimension-info-table{
                  font-size: 10px;
                  padding-right: 0.2rem;
                  border-right: 2px solid #d1d5db;
                }
            </style>
          </head>
          <body>
            <div class="v-container">
              <!-- Content will be injected here by script -->
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
              window.onafterprint = function() {
                window.close();
              };
            </script>
          </body>
        </html>
      `);

      const contentContainer = printWindow.document.querySelector(".v-container");
      const contentClone = containerRef.current.cloneNode(true);

      const svgElements = contentClone.querySelectorAll("svg");
      svgElements.forEach((svg) => {
        if (!svg.getAttribute("viewBox") && svg.width && svg.height) {
          svg.setAttribute(
            "viewBox",
            `0 0 ${svg.width.baseVal.value} ${svg.height.baseVal.value}`
          );
        }
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.width = "100%";
        svg.style.height = "auto";
      });

      const allElements = contentClone.querySelectorAll("*");
      allElements.forEach((el) => {
        el.style.userSelect = "text";
        el.style.webkitUserSelect = "text";

        if (window.getComputedStyle(el).position === "absolute") {
          el.style.position = "relative";
        }
      });

      const formElements = contentClone.querySelectorAll(
        'input, textarea, [contenteditable="true"]'
      );
      formElements.forEach((el) => {
        el.style.pointerEvents = "auto";

        if (el.hasAttribute("contenteditable")) {
          el.setAttribute("contenteditable", "true");
        }
      });

      const tableCells = contentClone.querySelectorAll("td");
      tableCells.forEach((cell) => {
        cell.style.paddingBottom = "0";
      });

      const tableInputs = contentClone.querySelectorAll(".table_input");
      tableInputs.forEach((input) => {
        input.style.marginBottom = "0";
        input.style.bottom = "0";
      });

      contentClone.style.transform = "none";
      contentClone.style.position = "static";
      contentClone.style.top = "auto";
      contentClone.style.left = "auto";
      contentClone.style.width = "100%";
      contentClone.style.height = "auto";
      contentClone.style.padding = "0";

      contentContainer.appendChild(contentClone);
      printWindow.document.close();
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
    <div className="fixed top-32 left-5 z-50">
      <button
        onClick={handlePrintPreview}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
      >
        <PreviewIcon />
        Print
      </button>
    </div>
  );
};

export default PrintPreviewButton;
