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
  drawingNumber: "SC-8370",
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
      "Screen MFR": "TD3207"
    },
    selectedMount: {
      "MFG. PART": "RLXT3"
    },
    selectedMediaPlayer: {
      "MFG. PART": "NS02AV2"
    },
    selectedReceptacleBox: {
      "MFG. PART": "Box2"
    },

    // Boolean values with defaults
    isHorizontal: false,
    isNiche: false,
    isEdgeToEdge: false,

    // Numeric values with defaults
    variantDepth: 4,
    floorDistance: 4,
    bottomDistance: 4,
    leftDistance: 0.1,
    boxGap: 4,
    boxCount: 4
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