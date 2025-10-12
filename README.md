# FinSight — Starter Project

This archive contains a minimal starter for the FinSight finance dashboard:
- backend/  — Express + MongoDB API
- frontend/ — Vite + React frontend

## Quick start (local)

1. Backend
   - Copy `backend/.env.example` to `backend/.env` and fill values (MONGO_URI, JWT_SECRET)
   - Install & run:
     ```
     cd backend
     npm install
     npm run dev
     ```
2. Frontend
   - Configure `frontend/.env` (or use .env.example)
     ```
     VITE_API_URL=http://localhost:5000/api
     ```
   - Install & run:
     ```
     cd frontend
     npm install
     npm run dev
     ```
3. Register a user on the frontend and start adding transactions and goals.

## Notes
- This is a starter template — expand validation, error handling, and styling as needed.
- For deployment use MongoDB Atlas, Render (backend), Vercel (frontend) as explained earlier.
