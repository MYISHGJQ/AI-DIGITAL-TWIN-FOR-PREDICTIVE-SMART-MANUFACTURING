import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "factory.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create machines table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS machines (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Healthy',
            health_score REAL DEFAULT 100.0,
            failure_probability REAL DEFAULT 0.0,
            air_temp REAL DEFAULT 298.0,
            process_temp REAL DEFAULT 308.0,
            rpm REAL DEFAULT 1500.0,
            torque REAL DEFAULT 40.0,
            tool_wear REAL DEFAULT 0.0,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create sensor_data table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            air_temp REAL,
            process_temp REAL,
            rpm REAL,
            torque REAL,
            tool_wear REAL,
            failure_prob REAL,
            health_score REAL,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    """)
    
    # Create predictions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            failure_predicted INTEGER,
            failure_probability REAL,
            confidence_score REAL,
            recommendation TEXT,
            FOREIGN KEY (machine_id) REFERENCES machines (id)
        )
    """)
    
    # Create reports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            filepath TEXT NOT NULL
        )
    """)
    
    # Seed default machines if not present or less than 10
    cursor.execute("SELECT COUNT(*) FROM machines")
    if cursor.fetchone()[0] < 10:
        cursor.execute("DELETE FROM machines")
        cursor.executemany("""
            INSERT INTO machines (id, name, type, status, health_score, failure_probability, air_temp, process_temp, rpm, torque, tool_wear)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            ('A', 'CNC Milling Machine A', 'L', 'Healthy', 98.5, 1.5, 298.2, 308.6, 1450.0, 42.1, 15.0),
            ('B', 'Robotic Arm Welder B', 'M', 'Healthy', 95.0, 5.0, 298.5, 308.9, 1500.0, 38.5, 32.0),
            ('C', 'Laser Cutting System C', 'H', 'Healthy', 96.2, 3.8, 298.1, 308.4, 1550.0, 35.2, 24.0),
            ('D', 'Hydraulic Press D', 'M', 'Healthy', 94.0, 6.0, 298.8, 309.1, 1480.0, 46.5, 45.0),
            ('E', 'Injection Molding Unit E', 'L', 'Healthy', 99.0, 1.0, 297.9, 307.8, 1420.0, 40.0, 10.0),
            ('F', 'CNC Turning Lathe F', 'H', 'Healthy', 93.5, 6.5, 298.4, 308.8, 1610.0, 37.8, 55.0),
            ('G', 'Automated Assembly Cell G', 'M', 'Healthy', 97.0, 3.0, 298.0, 308.2, 1490.0, 39.2, 20.0),
            ('H', 'Metal Stamping Press H', 'L', 'Healthy', 92.0, 8.0, 299.1, 309.5, 1380.0, 50.4, 68.0),
            ('I', 'Precision Surface Grinder I', 'H', 'Healthy', 98.0, 2.0, 297.8, 307.9, 1580.0, 33.1, 18.0),
            ('J', 'Automated Inspection Cell J', 'M', 'Healthy', 99.5, 0.5, 297.5, 307.5, 1500.0, 36.0, 5.0)
        ])
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
