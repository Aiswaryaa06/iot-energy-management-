// backend/src/controllers/deviceController.js
const db = require('../config/db');

// GET /api/devices - Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await db.query('SELECT * FROM Devices');
    return res.status(200).json({ success: true, data: devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve devices.' });
  }
};

// POST /api/devices/:id/toggle - Toggle device ON/OFF
exports.toggleDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the device
    const device = await db.get('SELECT * FROM Devices WHERE id = ?', [id]);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    // Determine new status
    const newStatus = device.status === 'ON' ? 'OFF' : 'ON';
    
    // Reset power consumption if toggling OFF
    const newPower = newStatus === 'OFF' ? 0.0 : device.power_consumption;

    await db.run(
      'UPDATE Devices SET status = ?, power_consumption = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, newPower, id]
    );

    // Fetch the updated device to return to UI
    const updatedDevice = await db.get('SELECT * FROM Devices WHERE id = ?', [id]);

    console.log(`Device '${device.name}' toggled to ${newStatus}`);

    return res.status(200).json({
      success: true,
      message: `Device status toggled to ${newStatus}`,
      data: updatedDevice
    });
  } catch (error) {
    console.error('Error toggling device status:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle device status.' });
  }
};
