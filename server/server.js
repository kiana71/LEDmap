// Import required modules
const express = require('express');      // Web framework for Node.js that makes it easy to build web applications
const mongoose = require('mongoose');    // MongoDB object modeling tool that helps us interact with MongoDB
const cors = require('cors');            // Middleware that enables Cross-Origin Resource Sharing (allows your frontend to communicate with the backend)
require('dotenv').config();              // Loads environment variables from your .env file

// Initialize Express app
const app = express();                   // Creates an Express application instance - this will be the foundation of your backend server

// Middleware setup
app.use(cors());                         // Enables your frontend to make requests to your backend
app.use(express.json());                 // Allows your server to parse JSON data from requests

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))    // Logs success message when connected
  .catch(err => console.error('MongoDB connection error:', err));  // Logs error if connection fails

// Add this after the MongoDB connection in server.js
const mapDataRoutes = require('./routes/mapData');
app.use('/api/mapdata', mapDataRoutes);

// Basic route to test server
app.get('/', (req, res) => {
  res.send('LED Technical Map API is running');       // Creates a test route at the root URL ('/')
});                                                  // When someone visits this route, they'll see "LED Technical Map API is running"

// Start server
const PORT = process.env.PORT || 5000;               // Sets the port number (uses the one from .env or defaults to 5000)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);  // Starts the server and logs a message when it's running
});