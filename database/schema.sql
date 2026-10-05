
CREATE DATABASE IF NOT EXISTS madinah_journey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE madinah_journey;

CREATE TABLE jamaah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jamaah_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  passport_no VARCHAR(80),
  group_name VARCHAR(50),
  bus_no VARCHAR(50),
  room_no VARCHAR(50),
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NULL,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) UNIQUE NULL,
  email VARCHAR(150) UNIQUE NULL,
  phone VARCHAR(30) UNIQUE NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin_operasional','tour_leader','jamaah') NOT NULL DEFAULT 'jamaah',
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE SET NULL
);

CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(255) NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

CREATE TABLE locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  accuracy DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_location_jamaah_time (jamaah_id, created_at),
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

CREATE TABLE sos_alerts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  status ENUM('active','handled','closed') DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  handled_at DATETIME NULL,
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NOT NULL,
  activity_name VARCHAR(150) NOT NULL,
  status ENUM('present','absent','late') DEFAULT 'present',
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

CREATE TABLE incidents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  jamaah_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('open','progress','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jamaah_id) REFERENCES jamaah(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  target_type ENUM('all','group','jamaah') DEFAULT 'all',
  target_value VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
