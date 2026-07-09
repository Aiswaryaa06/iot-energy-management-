// simulator/index.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS) || 5000;

console.log(`==================================================`);
console.log(` Starting IoT Home Energy Telemetry Simulator     `);
console.log(` Target API endpoint: ${API_URL}                  `);
console.log(` Interval: ${INTERVAL_MS / 1000} seconds          `);
console.log(`==================================================`);

// Helper to calculate realistic appliance current and power
function generateTelemetry(deviceName, status) {
  if (status !== 'ON') {
    return { voltage: 0, current: 0, power: 0, energy: 0 };
  }

  const voltage = 220 + Math.random() * 20; // 220V - 240V
  let current = 0;

  switch (deviceName) {
    case 'Air Conditioner':
      // High consumption appliance: 1000W to 1800W (e.g. compressor cycle)
      // Can occasionally spike above 1500W to trigger safety alerts!
      current = 4.5 + Math.random() * 3.5; 
      break;
    case 'Fan':
      // Low consumption: 50W to 80W
      current = 0.22 + Math.random() * 0.13;
      break;
    case 'Television':
      // Moderate consumption: 80W to 150W
      current = 0.36 + Math.random() * 0.32;
      break;
    case 'Refrigerator':
      // Intermittent compression cycle: 150W to 250W
      current = 0.68 + Math.random() * 0.45;
      break;
    case 'Washing Machine':
      // Moderate to high: 400W to 800W
      current = 1.8 + Math.random() * 1.8;
      break;
    default:
      current = 0.5 + Math.random() * 0.5;
      break;
  }

  const power = voltage * current; // Watts
  
  // Calculate energy consumed in this interval (5 seconds)
  // kWh = (Power in Watts / 1000) * (Interval in Seconds / 3600 seconds)
  const intervalHours = (INTERVAL_MS / 1000) / 3600;
  const energy = (power / 1000) * intervalHours; // kWh

  return {
    voltage: parseFloat(voltage.toFixed(1)),
    current: parseFloat(current.toFixed(2)),
    power: parseFloat(power.toFixed(1)),
    energy: parseFloat(energy.toFixed(6))
  };
}

// Main polling loop
async function pollDevicesAndSendTelemetry() {
  try {
    // 1. Fetch devices list and their status from backend
    const response = await fetch(`${API_URL}/devices`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.error('[Simulator] Failed to retrieve valid devices data.');
      return;
    }

    const devices = result.data;
    console.log(`[Simulator] Polled ${devices.length} devices. Processing status...`);

    // 2. Loop through devices and submit readings
    for (const device of devices) {
      const telemetry = generateTelemetry(device.name, device.status);
      
      console.log(
        `[Simulator] Device: ${device.name} (${device.status}) -> ` +
        `Voltage: ${telemetry.voltage}V, Current: ${telemetry.current}A, ` +
        `Power: ${telemetry.power}W, Energy Delta: ${telemetry.energy.toFixed(6)} kWh`
      );

      // Submit telemetry to backend API
      const postResponse = await fetch(`${API_URL}/energy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: device.id,
          voltage: telemetry.voltage,
          current: telemetry.current,
          power: telemetry.power,
          energy: telemetry.energy
        })
      });

      if (!postResponse.ok) {
        console.error(`[Simulator] Error sending telemetry for ${device.name}: ${postResponse.statusText}`);
      }

      /* 
       * AZURE IoT HUB INTEGRATION EXAMPLE:
       * If deploying to Azure, you would send this payload directly to Azure IoT Hub using the Device Client SDK:
       * 
       * const client = DeviceClient.fromConnectionString(deviceConnectionString, Mqtt);
       * const message = new Message(JSON.stringify(telemetry));
       * await client.sendEvent(message);
       * console.log(`Telemetry sent to Azure IoT Hub for device ${device.name}`);
       */
    }
    console.log(`--------------------------------------------------`);
  } catch (error) {
    console.error('[Simulator Error] Polling cycle failed:', error.message);
  }
}

// Start interval
pollDevicesAndSendTelemetry();
setInterval(pollDevicesAndSendTelemetry, INTERVAL_MS);
