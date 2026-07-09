// backend/src/controllers/alertController.js
const db = require('../config/db');

// GET /api/alerts - Get all alerts
exports.getAllAlerts = async (req, res) => {
  try {
    // Return alerts ordered by newest first
    const alerts = await db.query(`
      SELECT a.*, d.name as device_name, d.location 
      FROM Alerts a 
      LEFT JOIN Devices d ON a.device_id = d.id 
      ORDER BY a.timestamp DESC
    `);
    return res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve alerts.' });
  }
};

// DELETE /api/alerts/clear - Clear alert history
exports.clearAlerts = async (req, res) => {
  try {
    await db.run('DELETE FROM Alerts');
    return res.status(200).json({ success: true, message: 'Alert history cleared.' });
  } catch (error) {
    console.error('Error clearing alerts:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear alert history.' });
  }
};
