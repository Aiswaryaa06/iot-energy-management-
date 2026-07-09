// backend/src/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Determine database file path (resolved relative to backend root)
const envDbFile = process.env.DB_FILE || './database/smarthome.db';
const dbPath = path.isAbsolute(envDbFile) 
  ? envDbFile 
  : path.resolve(__dirname, '../../', envDbFile);

// Ensure the directory for the database file exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Initializing database connection at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite Database Connection Error:', err.message);
  } else {
    console.log('Connected to SQLite Database.');
    initializeDatabase();
  }
});

// Helper utilities to wrap sqlite3 in Promises
const dbHelper = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Automatically run schema and seed files if they exist
async function initializeDatabase() {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Loading database schema from:', schemaPath);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await dbHelper.exec(schemaSql);
      console.log('Database tables successfully verified/created.');
    } else {
      console.warn('Database schema.sql not found at:', schemaPath);
    }

    // Seed devices & users if they do not exist
    const row = await dbHelper.get('SELECT COUNT(*) as count FROM Devices');
    if (row && row.count === 0) {
      if (fs.existsSync(seedPath)) {
        console.log('Devices table empty. Loading seed data from:', seedPath);
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await dbHelper.exec(seedSql);
        console.log('Database seed data successfully inserted.');
      } else {
        console.warn('Database seed.sql not found at:', seedPath);
      }
    } else {
      console.log(`Database already has ${row ? row.count : 0} device(s) configured.`);
    }

    // Seed historical energy logs if they do not exist
    const logsCount = await dbHelper.get('SELECT COUNT(*) as count FROM EnergyLogs');
    if (logsCount && logsCount.count === 0) {
      console.log('Energy logs empty. Generating 7 days of realistic hourly history for demo...');
      const devices = await dbHelper.query('SELECT * FROM Devices');
      
      const insertLogSql = `
        INSERT INTO EnergyLogs (device_id, voltage, current, power, energy, timestamp)
        VALUES (?, ?, ?, ?, ?, datetime('now', ?))
      `;

      // Loop backward through the last 168 hours (7 days)
      for (let hourOffset = 168; hourOffset >= 0; hourOffset--) {
        const dateOffsetStr = `-${hourOffset} hours`;
        
        // Approximate actual hour of day (0-23)
        const currentHour = (new Date(Date.now() - hourOffset * 60 * 60 * 1000)).getHours();

        for (const device of devices) {
          let basePower = 0;
          let isActive = false;

          if (device.name === 'Air Conditioner') {
            basePower = 1200 + Math.random() * 400; // 1200W - 1600W
            // AC runs in afternoon (12-16) and evening/night (20-06)
            isActive = (currentHour >= 12 && currentHour <= 16) || (currentHour >= 20 || currentHour <= 6);
          } else if (device.name === 'Fan') {
            basePower = 60 + Math.random() * 20; // 60W - 80W
            isActive = Math.random() > 0.3; // ON 70% of the time
          } else if (device.name === 'Television') {
            basePower = 100 + Math.random() * 50; // 100W - 150W
            // TV runs in the evening (18-23)
            isActive = (currentHour >= 18 && currentHour <= 23);
          } else if (device.name === 'Refrigerator') {
            basePower = 180 + Math.random() * 40; // 180W - 220W
            isActive = true; // refrigerator is always connected
            // Refrigerator compressor cycles ON/OFF, runs ~40% of the time
            if (Math.random() > 0.4) {
              basePower = 8 + Math.random() * 4; // Idle state 8W - 12W
            }
          } else if (device.name === 'Washing Machine') {
            basePower = 500 + Math.random() * 300; // 500W - 800W
            // Washing machine runs in the morning, say 8-10 AM, every 2nd day
            isActive = (currentHour === 8 || currentHour === 9) && (hourOffset % 48 < 2);
          }

          const power = isActive ? basePower : 0;
          const voltage = power > 0 ? 220 + Math.random() * 15 : 0;
          const current = power > 0 ? power / voltage : 0;
          const energy = (power / 1000) * 1.0; // kWh (consumed during 1 hour)

          if (power > 0) {
            await dbHelper.run(insertLogSql, [device.id, voltage, current, power, energy, dateOffsetStr]);
          }
        }
      }
      console.log('Historical energy logs generated successfully.');
    } else {
      console.log(`Database already has ${logsCount.count} telemetry records.`);
    }

  } catch (error) {
    console.error('Error during database schema/seed initialization:', error.message);
  }
}

module.exports = dbHelper;
