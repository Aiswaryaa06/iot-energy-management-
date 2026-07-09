// azure-functions/IoTHubTrigger/index.js
// Azure Function triggered by messages from Azure IoT Hub
// Ingests telemetry and stores it directly in Azure SQL Database

const { Connection, Request } = require('tedious'); // tedious is the official MS SQL client for Node.js

const dbConfig = {
  server: process.env.AZURE_SQL_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD
    }
  },
  options: {
    database: process.env.AZURE_SQL_DATABASE,
    encrypt: true,
    trustServerCertificate: false
  }
};

module.exports = async function (context, IoTHubMessages) {
  context.log(`Received ${IoTHubMessages.length} message(s) from IoT Hub.`);

  // Connect to Azure SQL Database
  const connection = new Connection(dbConfig);
  
  await new Promise((resolve, reject) => {
    connection.on('connect', (err) => {
      if (err) {
        context.log.error('Database connection failed:', err);
        reject(err);
      } else {
        context.log('Database connected successfully.');
        resolve();
      }
    });
    connection.connect();
  });

  for (const message of IoTHubMessages) {
    try {
      const telemetry = typeof message === 'string' ? JSON.parse(message) : message;
      context.log(`Processing telemetry:`, telemetry);

      const { device_id, voltage, current, power, energy } = telemetry;

      // 1. Insert Energy Log into Database
      const insertQuery = `
        INSERT INTO EnergyLogs (device_id, voltage, current, power, energy, timestamp)
        VALUES (@deviceId, @voltage, @current, @power, @energy, GETDATE())
      `;

      await executeSql(connection, insertQuery, [
        { name: 'deviceId', type: 'Int', value: device_id },
        { name: 'voltage', type: 'Float', value: voltage },
        { name: 'current', type: 'Float', value: current },
        { name: 'power', type: 'Float', value: power },
        { name: 'energy', type: 'Float', value: energy }
      ]);

      // 2. Update Device Today Energy Accumulation and current Power draw
      const updateQuery = `
        UPDATE Devices 
        SET power_consumption = @power, 
            today_energy = today_energy + @energy, 
            updated_at = GETDATE() 
        WHERE id = @deviceId
      `;
      await executeSql(connection, updateQuery, [
        { name: 'power', type: 'Float', value: power },
        { name: 'energy', type: 'Float', value: energy },
        { name: 'deviceId', type: 'Int', value: device_id }
      ]);

      // 3. Alert Logic (Power > 1500W)
      if (power > 1500) {
        const alertMsg = `Device ID ${device_id} exceeded safety threshold with power draw of ${power.toFixed(0)} W.`;
        const alertQuery = `
          INSERT INTO Alerts (device_id, type, message, severity, timestamp)
          VALUES (@deviceId, 'High Consumption', @message, 'Critical', GETDATE())
        `;
        await executeSql(connection, alertQuery, [
          { name: 'deviceId', type: 'Int', value: device_id },
          { name: 'message', type: 'NVarChar', value: alertMsg }
        ]);
        context.log(`[ALERT] Safety alert logged for device ID ${device_id}.`);
      }

    } catch (err) {
      context.log.error('Error processing IoT Hub message:', err.message);
    }
  }

  connection.close();
};

function executeSql(connection, sqlQuery, params = []) {
  return new Promise((resolve, reject) => {
    const request = new Request(sqlQuery, (err, rowCount) => {
      if (err) reject(err);
      else resolve(rowCount);
    });

    params.forEach(param => {
      request.addParameter(param.name, connection.types[param.type], param.value);
    });

    connection.execSql(request);
  });
}
