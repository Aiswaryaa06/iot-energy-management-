// backend/src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbHelper = require('./config/db'); // Triggers database connection and auto-initialization
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS so the React app can communicate with the backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Main API Router
app.use('/api', apiRoutes);

// Default Health Route for App Service monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'Azure IoT Energy Management System API'
  });
});

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const localDistPath = path.resolve(__dirname, '../../frontend/dist');
  const packageDistPath = path.resolve(__dirname, '../frontend/dist');
  
  // Choose the directory that exists
  const distPath = fs.existsSync(localDistPath) ? localDistPath : packageDistPath;
  
  console.log(`Serving static production client files from: ${distPath}`);
  app.use(express.static(distPath));
  
  // Return the SPA index file for any non-API routes
  app.get('*', (req, res, next) => {
    // If it's a request for API or other paths, skip to next handlers
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start listening for requests
app.listen(port, () => {
  console.log(`==================================================`);
  console.log(` Smart Home Energy Management API Server Active `);
  console.log(` Running in: ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` URL: http://localhost:${port}`);
  console.log(`==================================================`);
});
