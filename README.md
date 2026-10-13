# AI Digital Twin for Predictive Smart Manufacturing

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.1+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Random%20Forest-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

An end-to-end **Industrial Digital Twin Platform** engineered for predictive maintenance and real-time operational intelligence across smart manufacturing assets. 

The system models a 10-machine factory floor production line, continuously streams simulated multi-parameter telemetry, predicts failure risks using a trained **Random Forest Classifier** on the **AI4I 2020 dataset**, generates automated diagnostic advisories, and provides an eye-catching SaaS dashboard.

---

## 🏭 System Architecture & Key Capabilities

- **10 Virtual Machine Twins**:
  - `M-A`: CNC Milling Machine
  - `M-B`: Robotic Arm Welder
  - `M-C`: Laser Cutting System
  - `M-D`: Hydraulic Press
  - `M-E`: Injection Molding Unit
  - `M-F`: CNC Turning Lathe
  - `M-G`: Automated Assembly Cell
  - `M-H`: Metal Stamping Press
  - `M-I`: Precision Surface Grinder
  - `M-J`: Automated Inspection Cell
- **Top-Down Factory Layout Schematic**: Clean 2D production-line topology showing conveyor data-flow dynamics, directional chevrons, and color-coded status nodes (`Healthy`, `Warning`, `Critical`).
- **Predictive AI Diagnostics**: Real-time evaluation of failure probabilities, thermal load deviations, torque strain, and tool wear thresholds.
- **Top Risk Machines Ranking**: Dynamically prioritized list of vulnerable machines based on current failure risk.
- **Interactive Machine Diagnostics Modal**: Real-time multi-metric sensor charts (Air/Process Temperature, Rotational Speed, Torque, Tool Wear), prediction confidence, and one-click spindle recalibration.
- **One-Click Maintenance Calibration**: Resets tool wear and recalibrates physical twins back to baseline with instant feedback.
- **Automated PDF Health Reports**: Generates professional multi-page executive summaries via ReportLab.

---

## 🛠 Tech Stack

### Backend
- **FastAPI** / **Uvicorn**: Asynchronous high-throughput REST API.
- **scikit-learn** / **Joblib**: Random Forest Classifier for predictive maintenance.
- **SQLite**: Local persistent sensor history and prediction logging.
- **Pandas** & **NumPy**: Data processing and statistical feature modeling.
- **ReportLab**: PDF report generation.

### Frontend
- **React 19** & **Vite**: Ultra-responsive modular user interface.
- **Tailwind CSS**: Modern SaaS styling with light/dark theme support.
- **Chart.js** & **react-chartjs-2**: Real-time telemetry trends, status distribution donuts, and historical sensor plots.
- **Lucide Icons**: Industrial visual iconography.
- **Axios**: Asynchronous API communication and live polling.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/MYISHGJQ/AI-DIGITAL-TWIN-FOR-PREDICTIVE-SMART-MANUFACTURING.git
cd AI-DIGITAL-TWIN-FOR-PREDICTIVE-SMART-MANUFACTURING
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*API will run at [http://127.0.0.1:8000](http://127.0.0.1:8000)*  
*Interactive Swagger documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```
*Access the dashboard at [http://localhost:5173](http://localhost:5173)*

---

## 📊 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/machines` | Returns current state and summary for all 10 machines |
| `GET` | `/api/machines/{id}` | Detailed telemetry and sensor history for a specific machine |
| `POST` | `/api/machines/{id}/maintenance` | Calibrates spindle and resets tool wear to 0 min |
| `GET` | `/api/analytics` | Aggregated sensor statistics and machine utilization |
| `GET` | `/api/reports` | List generated PDF reports |
| `POST` | `/api/reports/generate` | Generates a new factory health PDF report |
| `GET` | `/api/simulation/config` | Reads current simulation state and interval |
| `POST` | `/api/simulation/config` | Updates simulation active state and interval |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
