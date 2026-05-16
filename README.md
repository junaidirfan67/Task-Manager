# HireHub Job Portal

HireHub is a production-style MERN job portal with JWT authentication, role-based dashboards, job posting, application tracking, MongoDB support, and a local JSON fallback for quick development.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Lucide icons
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt.js
- Storage: MongoDB Atlas in production, `backend/data/local-db.json` for local development without `MONGO_URI`

## Features

- Candidate signup/login, job search, job details, applications, and candidate dashboard
- Employer signup/login, job CRUD, applicant dashboard, and application status updates
- Public job board with search, location, type, and workplace filters
- Protected API routes with role authorization

## Setup

Install dependencies:

```bash
npm run install:all
```

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set these values before deployment:

```text
MONGO_URI=
JWT_SECRET=
PORT=5000
FRONTEND_URL=http://localhost:5173
```

For quick local testing, the backend starts without `.env` and uses local JSON storage.

## Run Locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

The frontend runs at `http://localhost:5173` and calls `http://localhost:5000/api`.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `GET /api/jobs/employer/mine`
- `POST /api/applications/apply/:jobId`
- `GET /api/applications/me`
- `GET /api/applications/employer`
- `PATCH /api/applications/:id/status`

## Deployment

1. Push the project to GitHub.
2. Create a MongoDB Atlas cluster.
3. Deploy `backend/` to Render and add `MONGO_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL`.
4. Deploy `frontend/` to Vercel.
5. Add `VITE_API_URL=https://your-render-api/api` to the frontend environment.
6. Redeploy and test candidate and employer flows.

## Resume Line

Built a full-stack MERN Job Portal with candidate and employer dashboards, JWT authentication, job posting, application tracking, protected APIs, and deployment-ready architecture.
