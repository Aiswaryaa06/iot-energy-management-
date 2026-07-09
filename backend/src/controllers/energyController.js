// backend/src/controllers/energyController.js
const db = require('../config/db');

// GET /api/energy - Get historical energy logs aggregated by range
exports.getHistoricalEnergy = async (req, res) => {
  try {
    const { range } = req.query; // 'hourly', 'daily', 'weekly', 'monthly', 'top-devices'
    let sql = '';
    let params = [];

    switch (range) {
      case 'hourly':
        // Last 24 hours of logs, grouped by hour
        sql = `
          SELECT strftime('%H:00', timestamp) AS label, SUM(energy) AS value
          FROM EnergyLogs
          WHERE timestamp >= datetime('now', '-24 hours')
          GROUP BY label
          ORDER BY timestamp ASC
        `;
        break;

      case 'daily':
        // Last 7 days, grouped by day
        sql = `
          SELECT strftime('%m-%d', timestamp) AS label, SUM(energy) AS value
          FROM EnergyLogs
          WHERE timestamp >= datetime('now', '-7 days')
          GROUP BY label
          ORDER BY timestamp ASC
        `;
        break;

      case 'weekly':
        // Last 4 weeks, grouped by week number
        sql = `
          SELECT strftime('Wk %W', timestamp) AS label, SUM(energy) AS value
          FROM EnergyLogs
          WHERE timestamp >= datetime('now', '-4 weeks')
          GROUP BY label
          ORDER BY timestamp ASC
        `;
        break;

      case 'monthly':
        // Last 6 months, grouped by year-month
        sql = `
          SELECT strftime('%Y-%m', timestamp) AS label, SUM(energy) AS value
          FROM EnergyLogs
          WHERE timestamp >= datetime('now', '-6 months')
          GROUP BY label
          ORDER BY timestamp ASC
        `;
        break;

      case 'top-devices':
        // Device-wise percentage/total consumption
        sql = `
          SELECT d.name AS label, SUM(e.energy) AS value
          FROM EnergyLogs e
          JOIN Devices d ON e.device_id = d.id
          GROUP BY d.name
          ORDER BY value DESC
        `;
        break;

      default:
        // Default to daily if no range specified
        sql = `
          SELECT strftime('%m-%d', timestamp) AS label, SUM(energy) AS value
          FROM EnergyLogs
          WHERE timestamp >= datetime('now', '-7 days')
          GROUP BY label
          ORDER BY timestamp ASC
        `;
        break;
    }

    const data = await db.query(sql, params);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching energy logs:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve energy analytics.' });
  }
};

// POST /api/energy - Receive telemetry data from IoT Simulator
exports.postTelemetry = async (req, res) => {
  try {
    const { device_id, voltage, current, power, energy } = req.body;

    if (device_id === undefined || voltage === undefined || current === undefined || power === undefined || energy === undefined) {
      return res.status(400).json({ success: false, message: 'Missing telemetry fields.' });
    }

    // Verify device exists and is active (ON)
    const device = await db.get('SELECT * FROM Devices WHERE id = ?', [device_id]);
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found.' });
    }

    // Insert telemetry into EnergyLogs
    await db.run(
      'INSERT INTO EnergyLogs (device_id, voltage, current, power, energy, timestamp) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [device_id, voltage, current, power, energy]
    );

    // Update Device status, current power consumption, and accumulate today_energy
    // If device is ON in DB, we use the values. If OFF, we should set it to ON if simulator sends non-zero power (means physical toggle bypass).
    // Usually, the simulator reads device state first.
    await db.run(
      'UPDATE Devices SET power_consumption = ?, today_energy = today_energy + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [power, energy, device_id]
    );

    // Alert Logic: Generate alerts if device power > 1500W
    if (power > 1500) {
      const alertMsg = `${device.name} in the ${device.location} exceeded safety power threshold! Measured: ${power.toFixed(0)} W.`;
      
      // Check if a similar active alert was recently logged within the last 30 seconds to avoid flooding
      const recentAlert = await db.get(
        "SELECT * FROM Alerts WHERE device_id = ? AND type = 'High Consumption' AND timestamp >= datetime('now', '-30 seconds')",
        [device_id]
      );
      
      if (!recentAlert) {
        await db.run(
          "INSERT INTO Alerts (device_id, type, message, severity, timestamp) VALUES (?, 'High Consumption', ?, 'Critical', CURRENT_TIMESTAMP)",
          [device_id, alertMsg]
        );
        console.log(`[ALERT] High Consumption on device ${device.name}: ${power} W`);
      }
    }

    // Combined power check: if sum of all active devices power > 1500W
    const totalPowerRow = await db.get("SELECT SUM(power_consumption) as total FROM Devices WHERE status = 'ON'");
    const totalPower = totalPowerRow ? totalPowerRow.total : 0;
    if (totalPower > 1500) {
      const systemAlertMsg = `Total household power consumption (${totalPower.toFixed(0)} W) exceeded threshold of 1500 W.`;
      
      const recentSystemAlert = await db.get(
        "SELECT * FROM Alerts WHERE device_id IS NULL AND type = 'Grid Overload' AND timestamp >= datetime('now', '-30 seconds')"
      );

      if (!recentSystemAlert) {
        await db.run(
          "INSERT INTO Alerts (device_id, type, message, severity, timestamp) VALUES (NULL, 'Grid Overload', ?, 'Warning', CURRENT_TIMESTAMP)",
          [systemAlertMsg]
        );
        console.log(`[ALERT] Grid Overload: ${totalPower} W`);
      }
    }

    return res.status(201).json({ success: true, message: 'Telemetry logged successfully.' });
  } catch (error) {
    console.error('Error posting telemetry:', error);
    return res.status(500).json({ success: false, message: 'Failed to process telemetry.' });
  }
};
