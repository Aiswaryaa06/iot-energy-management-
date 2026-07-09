-- database/schema.sql
-- Azure IoT Smart Home Energy Management System Database Schema
-- Compatible with both SQLite (local development) and Azure SQL Database (production)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- For Azure SQL: id INT IDENTITY(1,1) PRIMARY KEY
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devices Table
CREATE TABLE IF NOT EXISTS Devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- For Azure SQL: id INT IDENTITY(1,1) PRIMARY KEY
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(10) DEFAULT 'OFF', -- ON or OFF
    power_consumption REAL DEFAULT 0.0, -- In Watts
    today_energy REAL DEFAULT 0.0, -- Cumulative Today in kWh
    location VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EnergyLogs Table
CREATE TABLE IF NOT EXISTS EnergyLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- For Azure SQL: id INT IDENTITY(1,1) PRIMARY KEY
    device_id INTEGER NOT NULL,
    voltage REAL NOT NULL, -- In Volts (e.g. ~230)
    current REAL NOT NULL, -- In Amps
    power REAL NOT NULL, -- In Watts
    energy REAL NOT NULL, -- Cumulative energy at this point (kWh)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(id) ON DELETE CASCADE
);

-- 4. Alerts Table
CREATE TABLE IF NOT EXISTS Alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- For Azure SQL: id INT IDENTITY(1,1) PRIMARY KEY
    device_id INTEGER,
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Info', -- Info, Warning, Critical
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Devices(id) ON DELETE SET NULL
);
