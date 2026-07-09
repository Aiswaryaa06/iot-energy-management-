// backend/src/controllers/dashboardController.js
const db = require('../config/db');

// Keep tariff in-memory, initialized from env variable or default to 8.0
let currentTariff = parseFloat(process.env.DEFAULT_TARIFF) || 8.0;

// GET /api/dashboard - Get all dashboard metrics
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Current Power Usage (Sum of power consumption of active devices)
    const powerRow = await db.get("SELECT SUM(power_consumption) as total_power FROM Devices WHERE status = 'ON'");
    const currentPower = powerRow && powerRow.total_power ? parseFloat(powerRow.total_power) : 0.0;

    // 2. Today's Energy (Sum of energy logged from 00:00 of the current calendar day)
    const energyRow = await db.get(`
      SELECT SUM(energy) as total_energy 
      FROM EnergyLogs 
      WHERE timestamp >= date('now', 'start of day')
    `);
    const todayEnergy = energyRow && energyRow.total_energy ? parseFloat(energyRow.total_energy) : 0.0;

    // 3. Active Devices count
    const activeRow = await db.get("SELECT COUNT(*) as count FROM Devices WHERE status = 'ON'");
    const activeDevices = activeRow ? activeRow.count : 0;

    // 4. Retrieve recent alerts (last 5)
    const recentAlerts = await db.query(`
      SELECT a.*, d.name as device_name 
      FROM Alerts a 
      LEFT JOIN Devices d ON a.device_id = d.id 
      ORDER BY a.timestamp DESC 
      LIMIT 5
    `);

    // 5. Calculations for Electricity Bill
    const todayBill = todayEnergy * currentTariff;
    const estimatedMonthlyBill = todayEnergy * 30 * currentTariff; // Pro-rated estimate based on today's consumption

    return res.status(200).json({
      success: true,
      data: {
        currentPower,              // Watts
        todayEnergy,               // kWh
        activeDevices,             // count
        tariff: currentTariff,     // per kWh
        todayBill,                 // Currency
        estimatedMonthlyBill,      // Currency
        recentAlerts               // array
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics.' });
  }
};

// GET /api/settings/tariff - Retrieve current tariff
exports.getTariff = (req, res) => {
  return res.status(200).json({ success: true, tariff: currentTariff });
};

// POST /api/settings/tariff - Update tariff
exports.updateTariff = (req, res) => {
  try {
    const { tariff } = req.body;
    if (tariff === undefined || isNaN(tariff) || parseFloat(tariff) < 0) {
      return res.status(400).json({ success: false, message: 'Invalid tariff value.' });
    }
    
    currentTariff = parseFloat(tariff);
    console.log(`Electricity tariff updated to: ${currentTariff} per kWh`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Tariff updated successfully.',
      tariff: currentTariff 
    });
  } catch (error) {
    console.error('Error updating tariff:', error);
    return res.status(500).json({ success: false, message: 'Failed to update tariff.' });
  }
};
