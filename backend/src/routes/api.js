// backend/src/routes/api.js
const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const deviceController = require('../controllers/deviceController');
const energyController = require('../controllers/energyController');
const alertController = require('../controllers/alertController');
const dashboardController = require('../controllers/dashboardController');

// 1. Authentication Route
router.post('/auth/login', authController.login);

// 2. Dashboard Routes
router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/settings/tariff', dashboardController.getTariff);
router.post('/settings/tariff', dashboardController.updateTariff);

// 3. Devices Routes
router.get('/devices', deviceController.getAllDevices);
router.post('/devices/:id/toggle', deviceController.toggleDevice);

// 4. Energy Logs / Telemetry Routes
router.get('/energy', energyController.getHistoricalEnergy);
router.post('/energy', energyController.postTelemetry);

// 5. Alerts Routes
router.get('/alerts', alertController.getAllAlerts);
router.delete('/alerts/clear', alertController.clearAlerts);

module.exports = router;
