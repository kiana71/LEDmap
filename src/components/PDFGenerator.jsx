import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument';

const PDFGenerator = ({ contentRef }) => {
  const extractData = () => {
    if (!contentRef.current) return null;

    // Get SVG content
    const svg = contentRef.current.querySelector('svg');
    const svgContent = svg ? svg.outerHTML : '';

    // Extract measurements from SVG text elements
    const measurements = [];
    if (svg) {
      const textElements = svg.querySelectorAll('text');
      textElements.forEach(text => {
        // Only include measurement text (numbers with optional decimal)
        if (/^\d+(\.\d+)?$/.test(text.textContent.trim())) {
          measurements.push({
            value: text.textContent,
            x: text.getAttribute('x'),
            y: text.getAttribute('y'),
          });
        }
      });
    }

    // Get dimensions data
    const dimensionsElements = contentRef.current.querySelectorAll('.dimension-group');
    const dimensions = Array.from(dimensionsElements).map(group => ({
      title: group.querySelector('h3')?.textContent,
      items: Array.from(group.querySelectorAll('.dimension-item')).map(item => ({
        label: item.querySelector('.label')?.textContent,
        value: item.querySelector('.value')?.textContent,
      })),
    }));

    // Get notes content
    const notes = contentRef.current.querySelector('[contenteditable="true"]')?.textContent || '';

    // Get table data
    const table = contentRef.current.querySelector('.info-table');
    const tableData = table ? {
      rows: Array.from(table.querySelectorAll('tr')).map(row => 
        Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent)
      ),
    } : null;

    return {
      svgContent,
      dimensions,
      notes,
      tableData,
      measurements,
    };
  };

  return (
    <div>
      <PDFDownloadLink
        document={<PDFDocument data={extractData()} />}
        fileName="technical-drawing.pdf"
        className="px-3 py-1 bg-gray-200 rounded ml-2"
      >
        {({ blob, url, loading, error }) => 
          loading ? 'Generating PDF...' : 'Download PDF'
        }
      </PDFDownloadLink>
    </div>
  );
};

export default PDFGenerator; 