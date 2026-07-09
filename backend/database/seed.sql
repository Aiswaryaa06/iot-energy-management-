-- database/seed.sql
-- Seed script for initializing Users and Devices

-- Seed Default Admin User
-- In a real-world scenario, the password would be hashed. For this course project, we use plain/simple text as requested.
INSERT OR IGNORE INTO Users (id, email, password, created_at)
VALUES (1, 'admin@smarthome.com', 'admin123', CURRENT_TIMESTAMP);

-- Seed Default Devices
INSERT OR IGNORE INTO Devices (id, name, status, power_consumption, today_energy, location, updated_at)
VALUES 
(1, 'Air Conditioner', 'OFF', 0.0, 0.0, 'Living Room', CURRENT_TIMESTAMP),
(2, 'Fan', 'OFF', 0.0, 0.0, 'Bedroom', CURRENT_TIMESTAMP),
(3, 'Television', 'OFF', 0.0, 0.0, 'Living Room', CURRENT_TIMESTAMP),
(4, 'Refrigerator', 'OFF', 0.0, 0.0, 'Kitchen', CURRENT_TIMESTAMP),
(5, 'Washing Machine', 'OFF', 0.0, 0.0, 'Laundry Room', CURRENT_TIMESTAMP);
