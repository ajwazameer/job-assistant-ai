# MASTER PRD — AI Job Application Assistant

## For: AI coding agent (vibe-coding tool)

## Read this file FIRST, before touching any code.

---

## 0. How to use this document set

This project is broken into 8 build modules, each split further into an **a** (backend) and **b** (frontend) sub-part — 16 sub-modules total, sized to fit a single Cursor Agent request comfortably, which matters on the free/Hobby plan. Build **one sub-module at a time, in order**, and **stop and wait for user confirmation** before starting the next one.

Files in this set:

```
00_MASTER_PRD.md                          ← this file (rules + architecture, read first)
CURSOR_SETUP_GUIDE.md                     ← read this before Module 1a if using Cursor

01a_backend_setup_auth.md
01b_frontend_auth.md
02a_backend_job_search.md
02b_frontend_job_search.md
03a_backend_resume_parsing.md
03b_frontend_resume_upload.md
04a_backend_ai_tailoring.md
04b_frontend_tailor_result.md
05a_pdf_templates.md
05b_pdf_integration.md
06a_backend_applications.md
06b_frontend_dashboard.md
07a_gsap_hooks_landing_jobcards.md
07b_gsap_dashboard_kanban.md
08a_backend_deploy.md
08b_frontend_deploy_smoketest.md
```

Feed the agent one sub-module file at a time. Do not paste multiple at once — that causes scope creep and half-finished features across the codebase, and burns through free-tier Agent requests faster with less control over what got built.

---

## 1. Hard rules for the agent (non-negotiable)

1. **Stay inside the project folder.** Never install anything globally, never modify system-level config, never touch files outside the project directory being built.
2. **Only touch files listed in the current module's "Files to create/modify" section.** If a module needs a file not listed there, stop and ask the user instead of guessing.
3. **One module = one working, testable slice.** Do not start module N+1 code until module N's acceptance checklist passes.
4. **Never invent new npm packages** beyond what's listed in the module. If something extra seems necessary, ask first.
5. **All secrets (API keys, JWT secret, DB URI) go in `.env`.** Never hardcode a key in source. Always add a `.env.example` with empty placeholder values.
6. **Commit to git after each module is completed and confirmed working** — one commit per module, clear commit message (e.g. `feat: module 2 - job search`).
7. **Do not refactor or "improve" previous modules' code unless the current module's spec explicitly says to.** Scope creep across modules is the #1 way vibe-coded projects break.
8. **If a module's instructions are ambiguous, ask the user rather than assuming.**
9. **After finishing a module, print a short summary**: what was built, what files changed, and the acceptance checklist status (pass/fail per item).

---

## 2. Tech stack (fixed — do not substitute)

| Layer                   | Choice                                                 |
| ----------------------- | ------------------------------------------------------ |
| Frontend                | React (Vite) + Tailwind CSS + GSAP                     |
| Backend                 | Node.js + Express                                      |
| Database                | MongoDB Atlas + Mongoose                               |
| Auth                    | JWT (access + refresh tokens) + bcrypt                 |
| AI/LLM                  | Groq API (Llama 3.1/3.3 model)                         |
| File storage            | Cloudinary                                             |
| Resume parsing          | `pdf-parse` (PDF), `mammoth` (DOCX)                    |
| PDF generation          | `@react-pdf/renderer`                                  |
| Job data                | Adzuna API, Jooble API, Arbeitnow API                  |
| Hosting (module 8 only) | Frontend: Vercel · Backend: Render · DB: MongoDB Atlas |

---

## 3. Full file structure (target end state)

The agent should build toward this structure. Each module will only create the subset of this relevant to it — this is the map, not a to-do list for one sitting.

```
job-assistant/
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── TailoredResume.js
│   │   └── JobApplication.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── tailorRoutes.js
│   │   └── applicationRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── resumeController.js
│   │   ├── tailorController.js
│   │   └── applicationController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── jobSearchService.js       (calls Adzuna/Jooble/Arbeitnow)
│   │   ├── resumeParseService.js     (file → text → AI → JSON)
│   │   ├── aiTailorService.js        (JD + resume JSON → tailored JSON)
│   │   └── pdfGenerateService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   └── utils/
│       ├── groqClient.js
│       └── promptTemplates.js
│
└── frontend/
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   ├── axiosInstance.js
    │   │   ├── authApi.js
    │   │   ├── jobApi.js
    │   │   ├── resumeApi.js
    │   │   ├── tailorApi.js
    │   │   └── applicationApi.js
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── JobSearch.jsx
    │   │   ├── ResumeUpload.jsx
    │   │   ├── TailorResult.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   ├── JobCard.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── MatchScoreRing.jsx
    │   │   ├── KanbanBoard.jsx
    │   │   ├── KanbanColumn.jsx
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   └── animations/
    │       └── gsapHooks.js
```

---

## 4. Module index (build order — do not skip or reorder)

| #   | Sub-module                   | What it delivers                                                              |
| --- | ---------------------------- | ----------------------------------------------------------------------------- |
| 1a  | Backend Setup & Auth         | Project scaffold, DB connection, signup/login/JWT API, tested via REST client |
| 1b  | Frontend Auth                | Login/signup UI wired to 1a, placeholder dashboard                            |
| 2a  | Backend Job Search           | Job API integration (Adzuna/Jooble/Arbeitnow), save endpoint                  |
| 2b  | Frontend Job Search          | Search UI + filters wired to 2a                                               |
| 3a  | Backend Resume Parsing       | Upload endpoint, AI-structured JSON, Cloudinary storage                       |
| 3b  | Frontend Resume Upload       | Upload UI + editable parsed-data form                                         |
| 4a  | Backend AI Tailoring         | JD-matching endpoint → score + tailored JSON                                  |
| 4b  | Frontend Tailor Result       | JD input UI, score display, tailored content view                             |
| 5a  | PDF Templates                | Two standalone ATS-friendly react-pdf templates                               |
| 5b  | PDF Integration              | Template picker + real download wired into tailor flow                        |
| 6a  | Backend Applications         | CRUD + status pipeline + stats endpoints                                      |
| 6b  | Frontend Dashboard           | Real Kanban board, stats panel, "mark as applied" hooks                       |
| 7a  | GSAP Hooks & Landing         | Reusable animation hooks, landing page, job card stagger                      |
| 7b  | GSAP Dashboard & Kanban      | Match score ring animation, kanban/stats animation, page transitions          |
| 8a  | Backend Deploy               | Render deployment, prod env vars                                              |
| 8b  | Frontend Deploy & Smoke Test | Vercel deployment, CORS lockdown, full live smoke test                        |

Each sub-module file contains: goal, scope, exact files to touch, data/API contracts, and an acceptance checklist. The agent must not proceed past a sub-module until every item in its checklist is checked off.

---

## 5. What "done" means for the whole project

The user (Ajwa) should, at the end of module 8, be able to:

1. Sign up and log in
2. Search real jobs with filters
3. Upload her resume once
4. Paste a JD and get a tailored, scored resume
5. Download that resume as a PDF
6. Track that application on a Kanban board through to outcome
7. Explain every module's purpose and how it connects to the next, because it was built and understood one clear chunk at a time
