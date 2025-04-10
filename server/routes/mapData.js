// Import required modules
const express = require('express');      // Express framework for creating routes
const router = express.Router();         // Create a new router instance
const MapData = require('../models/MapData');  // Import the MapData model to interact with database

// GET /api/mapdata/drawings
// Returns a list of all available drawings for the search dropdown
router.get('/drawings', async (req, res) => {
    try {
      // Find all active configurations
      // Select only necessary fields for the dropdown (drawing number, name, dates)
      // Sort by last modified date (newest first)
      const drawings = await MapData.find({ isActive: true });
      console.log(drawings);
      res.json(drawings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    //drawing/99
  });

// GET /api/mapdata/drawing/:drawingNumber
// Loads a specific configuration by drawing number
router.get('/drawing/:drawingNumber', async (req, res) => {
    try {
      // Find configuration by drawing number
      // Must be active (not deleted)
      const configuration = await MapData.findOne({ 
        drawingNumber: req.params.drawingNumber,
        isActive: true 
      });
      if (!configuration) {
        return res.status(404).json({ message: 'Configuration not found' });
      }
      res.json(configuration);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// POST /api/mapdata
// Saves a new configuration
router.post('/', async (req, res) => {
    try {
      // Validate that drawing number exists in infoTable
      if (!req.body.infoTable || !req.body.infoTable.drawingNumber) {
        return res.status(400).json({ 
          message: 'Please enter the drawing number in the table to save the configuration' 
        });
      }

      // Create new configuration with all required data
      const mapData = new MapData({
        drawingNumber: req.body.infoTable.drawingNumber,  // Get drawing number from infoTable
        sidebarSettings: req.body.sidebarSettings,        // LED map settings from sidebar
        infoTable: req.body.infoTable,                    // Info table data
        noteArea: req.body.noteArea,                      // Notes content
        createdBy: req.body.userId,                       // User who created
        lastModifiedBy: req.body.userId                   // User who last modified
      });

      // Save to database
      const newMapData = await mapData.save();
      res.status(201).json(newMapData);
    
    } catch (error) {
      // Handle duplicate drawing number error (MongoDB error code 11000)
      if (error.code === 11000) {
        res.status(400).json({ 
          message: 'A configuration with this drawing number already exists' 
        });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  });

// PUT /api/mapdata/:drawingNumber
// Updates an existing configuration
router.put('/:drawingNumber', async (req, res) => {
    try {
      // Find existing configuration by drawing number
      const configuration = await MapData.findOne({ 
        drawingNumber: req.params.drawingNumber,
        isActive: true 
      });
      if (!configuration) {
        return res.status(404).json({ message: 'Configuration not found' });
      }

      // Update all provided fields, keep existing values if not provided
      configuration.sidebarSettings = req.body.sidebarSettings || configuration.sidebarSettings;
      configuration.infoTable = req.body.infoTable || configuration.infoTable;
      configuration.noteArea = req.body.noteArea || configuration.noteArea;
      configuration.lastModifiedBy = req.body.userId;
      configuration.version += 1;  // Increment version number
      configuration.lastModifiedAt = new Date();

      // Save updated configuration
      const updatedConfiguration = await configuration.save();
      res.json(updatedConfiguration);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// DELETE /api/mapdata/:drawingNumber
// Soft deletes a configuration (sets isActive to false instead of actually deleting)
router.delete('/:drawingNumber', async (req, res) => {
    try {
      // Find configuration by drawing number
      const configuration = await MapData.findOne({ 
        drawingNumber: req.params.drawingNumber,
        // isActive: true 
      });

      console.log(configuration);
      if (!configuration) {
        return res.status(404).json({ message: 'Configuration not found' });
      }

      // Soft delete by setting isActive to false
      configuration.isActive = false;
      configuration.lastModifiedBy = req.body.userId;
      configuration.lastModifiedAt = new Date();

      // Save the soft-deleted configuration
      await configuration.save();
      res.json({ message: 'Configuration deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Add this route to get all drawings
router.get('/', async (req, res) => {
  try {
    const drawings = await MapData.find({isActive: true});
    res.json(drawings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;