const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Define the MapData model schema
const MapData = require('./models/MapData');

// Create test data
const testData = {
  drawingNumber: "SC-8384",
  infoTable: {
    drawn: "John Doe",
    date: "2024-03-20",
    sheet: "A1",
    revision: "Rev 1",
    department: "Engineering",
    drawingNo: "SC-8336",
    screen: "Samsung 55",
    mount: "Wall Mount",
    mediaPlayer: "BrightSign",
    mountingInOn: "Wall",
    orientation: "Landscape"
  },
  sidebarSettings: {
    // Only save identifying fields for selections
    selectedScreen: {
      "Screen MFR": "43UM5N-E"
    },
    selectedMount: {
      "MFG. PART": "XSM1U"
    },
    selectedMediaPlayer: {
      "MFG. PART": "11DT00FFUS"
    },
    selectedReceptacleBox: {
      "MFG. PART": "TVBU505GC"
    },

    // Boolean values with defaults
    isHorizontal: false,
    isNiche: true,
    isEdgeToEdge: false,
//toggle options value vith default
floorLine:false,
centreLine:false,
woodBacking:false,
receptacleBox:false,
intendedPosition:true,
    // Numeric values with defaults
    variantDepth: 2,
    floorDistance: 2,
    bottomDistance: 2,
    leftDistance: 0.2,
    boxGap: 2,
    boxCount: 2,
    isColumnLayout: true
  },
  noteArea: "Test notes for SC-8359",
  userId: "default_user",
  createdBy: "default_user",
  lastModifiedBy: "default_user"
};

// Insert the test data
async function insertTestData() {
  try {
    // First, delete any existing drawing with the same number
    await MapData.deleteOne({ drawingNumber: testData.drawingNumber });

    // Then insert the new data
    const result = await MapData.create(testData);
    console.log('Test data inserted successfully:', result);
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

insertTestData(); 

