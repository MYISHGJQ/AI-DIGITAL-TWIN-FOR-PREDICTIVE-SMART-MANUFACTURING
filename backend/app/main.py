import os
import asyncio
from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from .db import init_db, get_db_connection, DB_PATH
from .simulator import load_resources, update_simulation, reset_machine_tool_wear, get_demo_mode, set_demo_mode
from .report_gen import generate_pdf_report

# Constants & Configs
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")

SIMULATION_ACTIVE = True
SIMULATION_INTERVAL = 2.0  # seconds

async def simulation_loop():
    """
    Lightweight timer-based simulation loop running inside the main event loop.
    """
    global SIMULATION_ACTIVE, SIMULATION_INTERVAL
    while True:
        if SIMULATION_ACTIVE:
            try:
                update_simulation()
            except Exception as e:
                print(f"Simulation error in loop: {e}")
        await asyncio.sleep(SIMULATION_INTERVAL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB and resources
    init_db()
    try:
        load_resources()
    except Exception as e:
        print(f"Failed to load/train ML resources during startup: {e}")
    
    # Run initial simulation step to seed some telemetry
    try:
        update_simulation()
    except Exception as e:
        print(f"Failed initial simulation run: {e}")
        
    # Start simulation timer task
    sim_task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown: cancel task
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Digital Twin Dashboard API",
    description="Backend API for Smart Manufacturing Digital Twin and Predictive Maintenance",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Digital Twin Dashboard Backend API is running."}

@app.get("/api/simulation/config")
def get_simulation_config():
    return {
        "active": SIMULATION_ACTIVE,
        "interval": SIMULATION_INTERVAL
    }

@app.post("/api/simulation/config")
def update_simulation_config(
    active: bool = Body(..., embed=True),
    interval: float = Body(..., embed=True)
):
    global SIMULATION_ACTIVE, SIMULATION_INTERVAL
    if interval < 0.5 or interval > 10.0:
        raise HTTPException(status_code=400, detail="Interval must be between 0.5 and 10.0 seconds")
    SIMULATION_ACTIVE = active
    SIMULATION_INTERVAL = interval
    return {
        "active": SIMULATION_ACTIVE,
        "interval": SIMULATION_INTERVAL,
        "message": "Simulation configuration updated."
    }

@app.get("/api/machines")
def get_machines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM machines")
    rows = cursor.fetchall()
    
    machines_list = []
    healthy_count = 0
    warning_count = 0
    critical_count = 0
    
    for row in rows:
        m = dict(row)
        machines_list.append(m)
        status = m['status']
        if status == 'Healthy':
            healthy_count += 1
        elif status == 'Warning':
            warning_count += 1
        elif status == 'Critical':
            critical_count += 1
            
    conn.close()
    
    return {
        "machines": machines_list,
        "summary": {
            "total": len(machines_list),
            "healthy": healthy_count,
            "warning": warning_count,
            "critical": critical_count
        }
    }

@app.get("/api/machines/{machine_id}")
def get_machine_details(machine_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Fetch current machine parameters
    cursor.execute("SELECT * FROM machines WHERE id = ?", (machine_id,))
    machine_row = cursor.fetchone()
    if not machine_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    machine = dict(machine_row)
    
    # Add recommendation dynamically if missing
    # (should exist in database but fallback is good)
    from .simulator import generate_recommendation
    machine['recommendation'] = generate_recommendation(
        machine['status'], machine['health_score'], machine['air_temp'],
        machine['rpm'], machine['torque'], machine['tool_wear']
    )
    
    # 2. Fetch recent sensor history (limit to 30 items for live chart)
    cursor.execute("""
        SELECT * FROM sensor_data 
        WHERE machine_id = ? 
        ORDER BY timestamp DESC LIMIT 30
    """, (machine_id,))
    history = [dict(row) for row in cursor.fetchall()]
    history.reverse() # Order chronologically for charts
    
    # 3. Fetch recent prediction details
    cursor.execute("""
        SELECT * FROM predictions 
        WHERE machine_id = ? 
        ORDER BY timestamp DESC LIMIT 10
    """, (machine_id,))
    predictions = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "machine": machine,
        "history": history,
        "predictions": predictions
    }

@app.post("/api/machines/{machine_id}/maintenance")
def trigger_maintenance(machine_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM machines WHERE id = ?", (machine_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    conn.close()
        
    try:
        reset_machine_tool_wear(machine_id)
        return {
            "success": True,
            "message": f"Tool wear reset and calibration complete for Machine {machine_id}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform maintenance: {str(e)}")

@app.get("/api/analytics")
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch all data to compute summaries
    cursor.execute("SELECT * FROM sensor_data")
    rows = [dict(r) for r in cursor.fetchall()]
    
    # Baseline fallback if database is empty
    if not rows:
        conn.close()
        return {
            "averages": {"air_temp": 298.0, "rpm": 1500.0, "health": 100.0},
            "failures_count": 0,
            "status_distribution": {"Healthy": 10, "Warning": 0, "Critical": 0},
            "utilization": {m_id: 90.0 for m_id in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']}
        }
    
    # Averages
    avg_air_temp = sum(r['air_temp'] for r in rows) / len(rows)
    avg_rpm = sum(r['rpm'] for r in rows) / len(rows)
    avg_health = sum(r['health_score'] for r in rows) / len(rows)
    
    # Count of failed steps vs healthy steps in the sensor history
    # (predictive maintenance history)
    failures_in_history = sum(1 for r in rows if r['failure_prob'] > 50.0)
    total_samples = len(rows)
    
    # Fetch current machine statuses
    cursor.execute("SELECT id, status, health_score, rpm FROM machines")
    current_machines = cursor.fetchall()
    
    status_distribution = {"Healthy": 0, "Warning": 0, "Critical": 0}
    utilization = {}
    
    for m in current_machines:
        status_distribution[m['status']] += 1
        # Calculate dynamic mock utilization based on RPM relative to ideal 1500 rpm
        # Caps it between 80% and 98% for realistic visuals
        base_util = 90.0 + (m['rpm'] - 1500.0) / 200.0
        utilization[m['id']] = round(max(80.0, min(98.0, base_util)), 1)
        
    conn.close()
    
    return {
        "averages": {
            "air_temp": round(avg_air_temp, 2),
            "rpm": round(avg_rpm, 1),
            "health": round(avg_health, 1)
        },
        "history_stats": {
            "total_records": total_samples,
            "failures_detected": failures_in_history,
            "healthy_records": total_samples - failures_in_history
        },
        "status_distribution": status_distribution,
        "utilization": utilization
    }

@app.post("/api/reports/generate")
def generate_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch all machines current parameters
    cursor.execute("SELECT * FROM machines")
    machines = [dict(row) for row in cursor.fetchall()]
    
    # Inject dynamic recommendations for each machine to print
    from .simulator import generate_recommendation
    for m in machines:
        m['recommendation'] = generate_recommendation(
            m['status'], m['health_score'], m['air_temp'],
            m['rpm'], m['torque'], m['tool_wear']
        )
        
    conn.close()
    
    # Create filename
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_title = f"Factory Health Report - {datetime.now().strftime('%b %d, %Y (%H:%M:%S)')}"
    filename = f"health_report_{timestamp_str}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    try:
        generate_pdf_report(machines, filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF document: {str(e)}")
        
    # Log report inside database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reports (title, type, filepath)
        VALUES (?, 'Health', ?)
    """, (report_title, filepath))
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": report_id,
        "title": report_title,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "filename": filename
    }

@app.get("/api/reports")
def get_reports():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, type, created_at FROM reports ORDER BY created_at DESC")
    rows = cursor.fetchall()
    reports_list = [dict(row) for row in rows]
    conn.close()
    return reports_list

@app.get("/api/reports/download/{report_id}")
def download_report(report_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT filepath FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Report not found in database")
        
    filepath = row['filepath']
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
        
    return FileResponse(
        filepath, 
        media_type="application/pdf", 
        filename=os.path.basename(filepath)
    )
