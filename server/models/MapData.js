const mongoose = require('mongoose');

const mapDataSchema = new mongoose.Schema({
  drawingNumber: {
    type: String,
    required: [true, 'Drawing number is required to save configuration'],
    unique: true
  },
  name: {
    type: String,
    default: function() {
      return `Configuration for Drawing ${this.drawingNumber}`;
    }
  },
  description: String,
  sidebarSettings: {
    type: Object,
    required: true
  },
  infoTable: {
    type: Object,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.drawingNumber;
      },
      message: 'Drawing number must be entered in the info table'
    }
  },
  noteArea: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: {
    type: String,
    required: true
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
mapDataSchema.index({ drawingNumber: 1, isActive: 1 });
mapDataSchema.index({ lastModifiedAt: -1 });

module.exports = mongoose.model('MapData', mapDataSchema); 