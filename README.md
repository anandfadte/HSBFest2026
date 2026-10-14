# Zenith '26 College Fest Management System 🚀

A complete, full-stack college fest management web application built with **FastAPI**, **SQLite**, **Tailwind CSS**, and **Vanilla JavaScript**, designed for high performance, reliability, and clean API contracts.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- **Database:** SQLite (`fest.db`), with automated initial seeding via `openpyxl` from `data/events_seed.xlsx`
- **Frontend:** Responsive HTML5, Tailwind CSS (via CDN), Vanilla JavaScript ES6+
- **Testing & Verification:** Postman Desktop (`zenith26-api.postman_collection.json`)

---

## 📂 Project Structure

```text
zenith26-fest-system/
├── backend/
│   ├── database.py       # SQLite connection, pragmas, table schemas & init_db
│   ├── models.py         # Pydantic schemas for events, registration & live stats
│   ├── seed_data.py      # Automated Excel reader & database seeder
│   └── main.py           # FastAPI app, API routes, CORS, static file serving
├── frontend/
│   ├── index.html        # Student event discovery & registration portal
│   ├── admin.html        # Fest coordinator admin dashboard
│   └── js/
│       ├── app.js        # Dynamic card rendering, search, filters & registration logic
│       └── admin.js      # Live metrics, utilization table, registration cancellation & event creator
├── data/
│   └── events_seed.xlsx  # 14 sample fest events spreadsheet
├── fest.db               # SQLite database file (created on startup)
├── zenith26-api.postman_collection.json  # Exported Postman test suite
├── requirements.txt      # Project Python dependencies
└── README.md             # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure you have Python 3.11+ installed.

### 2. Setup Virtual Environment & Install Dependencies
From the `zenith26-fest-system` folder:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 3. Verify Seed Data
The companion file `events_seed.xlsx` is located in `data/events_seed.xlsx`. You can run the database seeder manually or let FastAPI seed it on startup:
```bash
python -m backend.seed_data
```

### 4. Run the Application
Start the Uvicorn development server:
```bash
uvicorn backend.main:app --reload
```

The application will be live at:
- **Student Event Portal:** [http://localhost:8000/](http://localhost:8000/)
- **Admin Coordinator Dashboard:** [http://localhost:8000/admin.html](http://localhost:8000/admin.html)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 API Contract Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all events with live `available_seats`. Query params: `category`, `search`. |
| `GET` | `/api/events/{event_id}` | Retrieve details for a specific event (or `404 Not Found`). |
| `POST` | `/api/events/{event_id}/register` | Register a student with strict server-side validation (`201`, `400`, `404`, `409`). |
| `GET` | `/api/registrations` | List all registrations with event titles. Query param: `event_id`. |
| `GET` | `/api/stats` | Live fest metrics (total events, registrations, capacity %, category breakdown). |
| `POST` | `/api/events` | *(Stretch Goal)* Coordinator creates a new fest event (`201`). |
| `DELETE` | `/api/registrations/{reg_id}` | *(Stretch Goal)* Coordinator cancels a registration, restoring seats (`200`). |

---

## 🧪 Postman Testing

1. Open the Postman Desktop App.
2. Click **Import** and select `zenith26-api.postman_collection.json`.
3. Set your environment variable `base_url` = `http://localhost:8000`.
4. Run requests in the organized folders:
   - **Events:** List, category filter, title search, single event fetch, 404 test.
   - **Registration:** 201 success, 409 duplicate email, 400 empty field, 400 invalid email, 404 non-existent event.
   - **Admin:** List all registrations, filter by event ID, live dashboard stats.
   - **Stretch Goals:** Add new event, cancel registration.
