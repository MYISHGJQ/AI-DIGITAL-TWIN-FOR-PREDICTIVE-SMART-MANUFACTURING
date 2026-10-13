import os
import random
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from .db import get_db_connection, init_db

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "ai4i2020.csv")
MODEL_PATH = os.path.join(BASE_DIR, "app", "model.joblib")

# Global variables for loaded model and data
_model_meta = None
_df_healthy = None
_df_failures = None

def load_resources():
    global _model_meta, _df_healthy, _df_failures
    
    # Auto-train if model does not exist
    if not os.path.exists(MODEL_PATH) or not os.path.exists(DATA_PATH):
        print("Model or dataset not found. Triggering auto-setup and training...")
        from .train import train_model
        train_model()
        
    if _model_meta is None:
        print("Loading trained Random Forest model from:", MODEL_PATH)
        _model_meta = joblib.load(MODEL_PATH)
        
    if _df_healthy is None or _df_failures is None:
        print("Loading local AI4I dataset from:", DATA_PATH)
        df = pd.read_csv(DATA_PATH)
        # Classify rows for quick simulation retrieval
        _df_healthy = df[df['Machine failure'] == 0].reset_index(drop=True)
        _df_failures = df[df['Machine failure'] == 1].reset_index(drop=True)

# Global Demo Mode State
_demo_mode_active = False

def set_demo_mode(active: bool):
    global _demo_mode_active
    _demo_mode_active = active
    return _demo_mode_active

def get_demo_mode():
    global _demo_mode_active
    return _demo_mode_active

def generate_recommendation(status, health_score, temp, rpm, torque, tool_wear):
    """
    Deterministic rule-based recommendation engine for Smart Maintenance Insights.
    """
    if status == "Healthy":
        return "Optimal operating conditions. Continue standard inspection intervals."
        
    if status == "Warning":
        causes = []
        if tool_wear > 150:
            causes.append(f"Tool wear elevated ({tool_wear:.1f} min)")
        if temp > 302.0:
            causes.append(f"Temperature high ({temp:.1f} K)")
        if torque > 52.0:
            causes.append(f"Torque elevated ({torque:.1f} Nm)")
        if rpm > 2100:
            causes.append(f"Rotational speed elevated ({rpm:.0f} RPM)")
            
        cause_str = ", ".join(causes) if causes else "Minor metric drift"
        return f"WARNING ({cause_str}): Schedule tool inspection and clear thermal vents within the next 4 operating cycles."
        
    if status == "Critical":
        causes = []
        if tool_wear > 180:
            causes.append(f"Critical tool wear ({tool_wear:.1f} min)")
        if temp > 303.5:
            causes.append(f"Excessive thermal load ({temp:.1f} K)")
        if torque > 60.0:
            causes.append(f"High motor torque ({torque:.1f} Nm)")
            
        cause_str = ", ".join(causes) if causes else "High predicted failure probability"
        return f"CRITICAL ALERT ({cause_str}): Inspect machine immediately. Replace worn tool head and halt spindle feed line within 24 hours."
        
    return "Verify machine telemetry and sensor connectivity."

def update_simulation():
    """
    Performs a single simulation step for Machines A through J.
    Updates the database with new telemetry, predictions, and recommendations.
    """
    init_db()
    load_resources()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Retrieve current machines state
    cursor.execute("SELECT id, type, tool_wear, status, torque, process_temp FROM machines")
    rows = cursor.fetchall()
    if not rows:
        conn.close()
        return
        
    current_machines = {row['id']: dict(row) for row in rows}
    all_machine_ids = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    
    for m_id in all_machine_ids:
        # If machine not in database yet, skip or use default
        if m_id not in current_machines:
            continue
            
        m_type = current_machines[m_id]['type']
        db_tool_wear = current_machines[m_id]['tool_wear']
        
        # Check if Demo Mode is actively degrading Machine D
        is_demo_target = (_demo_mode_active and m_id == 'D')
        
        # Random sample baseline from dataset
        # In Demo Mode for machine D, force drawing from failures if wear is high, or degrade manually
        failure_prob_threshold = 0.08 if current_machines[m_id]['status'] != 'Healthy' else 0.03
        is_failure_step = (random.random() < failure_prob_threshold) or (is_demo_target and db_tool_wear > 150)
        
        if is_failure_step and len(_df_failures) > 0:
            row = _df_failures.sample(1).iloc[0]
        else:
            row = _df_healthy.sample(1).iloc[0]
            
        air_temp = float(row['Air temperature [K]'])
        process_temp = float(row['Process temperature [K]'])
        rpm = float(row['Rotational speed [rpm]'])
        torque = float(row['Torque [Nm]'])
        
        # Tool wear calculation
        if db_tool_wear > 230 and not is_demo_target:
            new_tool_wear = 0.0
        else:
            wear_rate = random.uniform(3.5, 6.5) if is_demo_target else random.uniform(0.3, 1.2)
            new_tool_wear = db_tool_wear + wear_rate
            
        # Demo mode custom telemetry injection for Machine D
        if is_demo_target:
            torque = min(72.0, max(torque, 48.0 + (new_tool_wear / 180.0) * 22.0))
            process_temp = min(309.5, max(process_temp, 305.0 + (new_tool_wear / 180.0) * 4.0))
            air_temp = max(air_temp, 299.5)
            
        # Sensor jitter
        air_temp += random.uniform(-0.1, 0.1)
        process_temp += random.uniform(-0.1, 0.1)
        rpm += random.uniform(-5.0, 5.0)
        torque += random.uniform(-0.3, 0.3)
        
        # Machine learning feature vector
        X_live = pd.DataFrame(
            [[air_temp, process_temp, rpm, torque, new_tool_wear]], 
            columns=_model_meta["features"]
        )
        
        model = _model_meta["model"]
        prob = float(model.predict_proba(X_live)[0][1])
        pred = int(model.predict(X_live)[0])
        
        # Calculate health score
        health_score = (1.0 - prob) * 100.0
        if new_tool_wear > 150:
            penalty = ((new_tool_wear - 150) / 70) * 25
            health_score -= penalty
            
        health_score = max(0.0, min(100.0, health_score))
        
        # Status classification
        if health_score >= 80.0:
            status = "Healthy"
        elif health_score >= 50.0:
            status = "Warning"
        else:
            status = "Critical"
            
        rec = generate_recommendation(status, health_score, air_temp, rpm, torque, new_tool_wear)
        
        # Update database
        cursor.execute("""
            UPDATE machines 
            SET status = ?, health_score = ?, failure_probability = ?, 
                air_temp = ?, process_temp = ?, rpm = ?, torque = ?, tool_wear = ?, 
                last_update = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, round(health_score, 1), round(prob * 100.0, 1), 
              round(air_temp, 2), round(process_temp, 2), round(rpm, 1), 
              round(torque, 2), round(new_tool_wear, 1), m_id))
              
        cursor.execute("""
            INSERT INTO sensor_data (machine_id, air_temp, process_temp, rpm, torque, tool_wear, failure_prob, health_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (m_id, round(air_temp, 2), round(process_temp, 2), round(rpm, 1), 
              round(torque, 2), round(new_tool_wear, 1), round(prob * 100.0, 1), round(health_score, 1)))
              
        cursor.execute("""
            INSERT INTO predictions (machine_id, failure_predicted, failure_probability, confidence_score, recommendation)
            VALUES (?, ?, ?, ?, ?)
        """, (m_id, pred, round(prob * 100.0, 1), round(_model_meta["accuracy"] * 100.0, 1), rec))
        
        cursor.execute("""
            DELETE FROM sensor_data 
            WHERE id NOT IN (
                SELECT id FROM sensor_data 
                WHERE machine_id = ? 
                ORDER BY timestamp DESC LIMIT 50
            ) AND machine_id = ?
        """, (m_id, m_id))
        
    conn.commit()
    conn.close()

def reset_machine_tool_wear(machine_id):
    """
    Explicit maintenance trigger to reset tool wear back to 0.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE machines 
        SET tool_wear = 0.0, status = 'Healthy', health_score = 98.0, failure_probability = 2.0 
        WHERE id = ?
    """, (machine_id,))
    
    cursor.execute("""
        INSERT INTO predictions (machine_id, failure_predicted, failure_probability, confidence_score, recommendation)
        VALUES (?, 0, 2.0, 98.0, ?)
    """, (machine_id, "Maintenance performed. Tool head replaced and spindle recalibrated."))
    
    conn.commit()
    conn.close()
    print(f"Machine {machine_id} manually reset and calibrated.")

if __name__ == "__main__":
    update_simulation()
    print("Simulation step completed successfully for all 10 machines.")

