# Full Stack Task Manager

A MERN-style task management app with JWT authentication, protected task CRUD, priorities, due dates, dashboard statistics, and a responsive React UI.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Lucide icons
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt.js

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  server.js
frontend/
  src/
    api/
    components/
    context/
    pages/
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

3. Update `backend/.env` with your MongoDB connection string and JWT secret.

For quick local testing, the backend can also start without `backend/.env`. In that mode it uses `backend/data/local-db.json` and a dev-only JWT secret. Add real environment variables before deploying.

4. Start the backend:

```bash
npm run dev:backend
```

5. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

The frontend defaults to `http://localhost:5173` and calls the backend at `http://localhost:5000/api`.

## GitHub Pages Demo

This repository includes a GitHub Actions workflow that deploys the React frontend to GitHub Pages in demo mode. Demo mode stores users and tasks in the browser's local storage, so the link works for portfolio sharing without hosting the Node backend.

To publish:

```bash
git init
git add .
git commit -m "Build full stack task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then open the repository on GitHub, go to **Settings > Pages**, and choose **GitHub Actions** as the source if it is not already selected.

Demo login:

```text
Email: demo@taskmanager.com
Password: password123
```

For a true full-stack live deployment, host `backend/` on Render or Railway, connect MongoDB Atlas, and set `VITE_API_URL` for the frontend build.

## LinkedIn Post

```text
I built and deployed a responsive full-stack task manager using React, Tailwind CSS, Node.js, Express, JWT auth, and MongoDB-ready APIs.

Features:
- User registration and login
- Task CRUD
- Priorities and due dates
- Dashboard stats
- Responsive classic dashboard layout

Live demo: https://ali-jun.github.io/Task-Manager/
GitHub repo: https://github.com/Ali-Jun/Task-Manager
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/stats`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
