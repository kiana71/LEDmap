import React from 'react';
import { Document, Page, View, Text, StyleSheet, Svg, Path, G, Image } from '@react-pdf/renderer';
import convertSVGToComponents from '../utils/svgConverter';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 0,
  },
  section: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dimensionBox: {
    width: '25%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  bottomRow: {
    flexDirection: 'row',
    height: 180,
    gap: 24,
  },
  notes: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    backgroundColor: 'white',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: 'black',
  },
  text: {
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
});

const TableRow = ({ cells }) => (
  <View style={styles.tableRow}>
    {cells.map((cell, index) => (
      <View key={index} style={styles.tableCell}>
        <Text style={styles.text} selectable={true}>{cell}</Text>
      </View>
    ))}
  </View>
);

const DimensionGroup = ({ title, items }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={styles.heading} selectable={true}>{title}</Text>
    {items.map((item, index) => (
      <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.text} selectable={true}>{item.label}:</Text>
        <Text style={styles.text} selectable={true}>{item.value}</Text>
      </View>
    ))}
  </View>
);

const PDFDocument = ({ data }) => {
  const {
    svgContent,
    dimensions,
    notes,
    tableData,
    measurements,
  } = data || {};

  const svgComponents = svgContent ? convertSVGToComponents(svgContent) : null;

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.mainContent}>
            {/* SVG Layer */}
            <View style={styles.svgLayer}>
              {svgComponents}
            </View>
            
            {/* Text Layer for Measurements */}
            <View style={styles.textLayer}>
              {measurements?.map((measurement, index) => (
                <Text
                  key={index}
                  style={{
                    position: 'absolute',
                    left: measurement.x,
                    top: measurement.y,
                    fontSize: 10,
                    fontFamily: 'Helvetica',
                  }}
                  selectable={true}
                >
                  {measurement.value}
                </Text>
              ))}
            </View>
          </View>
          
          {dimensions && (
            <View style={styles.dimensionBox}>
              {dimensions.map((group, index) => (
                <DimensionGroup
                  key={index}
                  title={group.title}
                  items={group.items}
                />
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.bottomRow}>
          <View style={styles.notes}>
            <Text style={styles.heading} selectable={true}>Notes:</Text>
            <Text style={styles.text} selectable={true}>{notes}</Text>
          </View>
          
          <View style={styles.table}>
            {tableData?.rows?.map((row, index) => (
              <TableRow key={index} cells={row} />
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument; 