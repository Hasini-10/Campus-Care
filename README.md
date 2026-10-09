# CampusCare — Campus Complaint Portal

A beginner-friendly MERN-stack project for reporting and tracking campus issues.

## Features
- Create a complaint with title, category, location, description and reporter name
- View complaints in a dashboard with counts by status
- Search complaints and filter by category/status
- Update complaint status (Submitted → In Progress → Resolved)
- Delete a complaint
- MongoDB persistence through a Node.js/Express REST API
- Responsive interface for desktop and mobile

## Tech stack
- MongoDB database
- Express + Node.js REST API
- React + Vite frontend

## Requirements
Install Node.js LTS and either:
- MongoDB Community Server running on your computer, or
- a free MongoDB Atlas cluster.

## Setup in VS Code
1. Extract this ZIP and open the `campus-complaint-portal` folder in VS Code.
2. Open a terminal in VS Code (Terminal → New Terminal).
3. Run `npm run install-all`.
4. In `server`, copy `.env.example` to `.env`.
5. Set `MONGODB_URI` in `server/.env`.
   - Local MongoDB: `mongodb://127.0.0.1:27017/campuscare`
   - Atlas: paste your Atlas connection string and replace `<password>` with your database user's password.
6. Run `npm run dev` from the root folder.
7. Open the URL printed by Vite, usually `http://localhost:5173`.

## API routes
- `GET /api/complaints` — list complaints; optional `?q=...&status=...&category=...`
- `POST /api/complaints` — create a complaint
- `PATCH /api/complaints/:id` — update status/details
- `DELETE /api/complaints/:id` — delete a complaint
- `GET /api/health` — server health check

## GitHub
Create an empty repository on GitHub. In VS Code, open Source Control, choose **Initialize Repository**, stage files, commit, then **Publish to GitHub**. Do not commit `server/.env`; it is ignored by `.gitignore`.

## Notes
This is a student demo, not a production system. Add authentication and authorization before using it with real student data. Don't enter sensitive personal information.
