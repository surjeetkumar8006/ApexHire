# <p align="center"><img src="https://img.icons8.com/color/96/000000/find-matching-job.png" alt="ApexHire Logo" width="80"/><br>ApexHire Portal</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</p>

---

## 📖 Overview

**ApexHire** is an industry-grade, full-stack Recruitment & Talent Analytics Platform designed to seamlessly connect **Students**, **Recruiters**, and **Placement Admins**. 

Built with a modern **glassmorphic UI design language** that adapts to both Light and Dark themes, the application features an automated Applicant Tracking System (ATS), real-time AI-powered resume parsed matches, mock interview desks, corporate alumni networks, and dynamic platform analytics.

---

## 🎨 Design & Aesthetic Highlights

- **Dynamic Theme Switcher:** Sleek, pill-shaped switcher transitioning between Light and Dark mode using custom HSL color systems.
- **Glassmorphism Design Language:** Modern layout panels utilizing blurred backdrops (`backdrop-filter`), glowing borders, and elegant micro-animations.
- **Responsive Layout:** Responsive flex/grid system that works flawlessly on mobile viewports, tablets, and wide desktop screens.
- **Premium Custom Modals:** Forms and inputs equipped with custom focus glow effects, top linear gradient accent bars, and animated transitions.

---

## 🌟 Core Role Features

### 👨‍🎓 1. Student Candidate Portal
- **AI Resume Review & Parser:** Upload PDF resumes to receive immediate parser results, 1-100 scores, skill extraction, and optimization tips.
- **Interactive Job Board & AI Match Score:** Search active job vacancies and get instant AI Match percentages detailing matching vs missing requirements.
- **Mock Interviews & Expert Feedback:** Conduct AI mock sessions and view comprehensive scorecards detailing both AI feedback and manual expert grading.
- **Interviews Scheduler:** View scheduled technical rounds, join video rooms, and submit post-interview candidate experience feedback (with 5-star ratings).

### 💼 2. Employer Recruiter Workspace
- **ATS Hiring Pipeline:** Filter candidates by stage and update applicant progress (Reviewing, Shortlisted, Interviewing, Offered, Rejected) using schema-synchronized dropdown selects.
- **Resume Search Engine:** Query the candidate directory database by specific skill keywords (e.g. React, Node) with verified avatar card visuals.
- **Job Opportunity Board:** Create, update, and manage job listings with location, salary range, and type options.
- **Meeting Scheduler:** Set up technical rounds and automatically generate Google Meet/Zoom join links with instant student notifications.

### 👑 3. Platform Placement Admin Console
- **Analytics & Funnel Charts:** Explore student statistics, job openings volume, and recruitment stage funnel status using Recharts charts.
- **Talent Directory Auditor:** Review profiles, audit student records, and toggle verified status badges.
- **Alumni & Referrals Manager:** Manage corporate alumni records, search directory tables, and approve/reject referral requests.
- **Broadcaster System:** Broadcast urgent placement announcements and notifications to all student screens in real-time.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite environment), Lucide React (Iconography), Recharts (Analytics visualization), HTML5, CSS3 Variables |
| **Backend** | Node.js, Express.js (Rest API endpoints), Multer (File uploads), JWT (State-free session tokens) |
| **Database** | MongoDB (Atlas cloud cluster), Mongoose (Data modeling & validations) |
| **AI Integration** | Google Gemini API (Resume parser, chatbot coach, AI matching metrics) |

---

## 📂 Project Directory Structure

```bash
ApexHire/
├── backend/
│   ├── config/             # Database connection setup (db.js)
│   ├── controllers/        # Express REST API controller controllers
│   ├── middleware/         # Multer setup & role authentication check
│   ├── models/             # Mongoose MongoDB models (User, Job, Interview, Application)
│   ├── routes/             # REST endpoint route registries
│   ├── server.js           # Express main server init script
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Layout templates (Navbar.jsx, Sidebar.jsx)
    │   ├── context/        # Providers (AuthContext.jsx, NotificationContext.jsx)
    │   ├── pages/          # Pages categorized into subfolders:
    │   │   ├── admin/      # Admin dashboards & managers
    │   │   ├── recruiter/  # Recruiter workspace & resumes bank
    │   │   ├── student/    # Candidate boards, resources, mock interview desks
    │   │   └── shared/     # Settings page, ComingSoon page, LandingPage
    │   ├── styles/         # Custom main.css stylesheet
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v16+) and **MongoDB** installed on your system.

### 2. Backend Configurations & Start
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file inside `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_authentication_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Fire up the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configurations & Start
1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 REST API Reference Table

All private endpoints require authorization header: `Authorization: Bearer <JWT_TOKEN>`.

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register a new user |
| **POST** | `/api/auth/login` | Public | Log in and return authorization token |
| **GET** | `/api/profile` | Private (All roles) | Fetch details of the logged-in user |
| **PUT** | `/api/profile` | Private (All roles) | Update logged-in user profile details |
| **GET** | `/api/jobs` | Private (All roles) | Fetch all active job listings |
| **POST** | `/api/jobs` | Private (Admin/Recruiter) | Create a new job vacancy listing |
| **PUT** | `/api/jobs/:id` | Private (Admin/Recruiter) | Modify job details (Only owner/admin) |
| **DELETE** | `/api/jobs/:id` | Private (Admin/Recruiter) | Remove a job listing (Only owner/admin) |
| **GET** | `/api/interviews/my` | Private (Student) | Get scheduled interviews list for candidates |
| **PUT** | `/api/interviews/:id` | Private (All roles) | Update status/submit candidate feedback notes |
| **GET** | `/api/recruiter/jobs` | Private (Recruiter) | Fetch jobs posted by the logged-in recruiter |
| **GET** | `/api/recruiter/applicants` | Private (Recruiter) | Fetch all applications for recruiter jobs |
| **PUT** | `/api/recruiter/applications/:id` | Private (Recruiter) | Update candidate ATS pipeline stages |
| **GET** | `/api/recruiter/analytics` | Private (Recruiter) | Get recruiter hiring funnel counts |
| **GET** | `/api/recruiter/resumes` | Private (Recruiter) | Search candidate resume database by skill |
| **GET** | `/api/profile/all` | Private (Admin) | Retrieve all student profiles |
| **PUT** | `/api/profile/verify/:id` | Private (Admin) | Toggle student verification status badge |
| **POST** | `/api/platform-config` | Private (Admin) | Save placement thresholds & requirements |

---

<p align="center">Made with ❤️ for AccioBuild 2026 Submission</p>
