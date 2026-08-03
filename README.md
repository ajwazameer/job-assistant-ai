# AI Job Application Assistant

Full-stack app for searching jobs, tailoring resumes with AI, and tracking applications.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS + GSAP
- **Backend:** Node.js + Express + MongoDB
- **Auth:** JWT (access + refresh tokens)
- **AI:** Groq API

## Getting started

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
node server.js
```

Server runs on `http://localhost:5000` (or `PORT` from `.env`).

### Frontend

Coming in Module 1b.
