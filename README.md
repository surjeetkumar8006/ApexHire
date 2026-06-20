# 🚀 ApexHire Portal — AI-Powered Talent Analytics & Hiring Platform

ApexHire is a premium, full-stack platform designed to bridge the gap between students, recruiters, and placement admins. Built using a modern, glassmorphic design language, the application incorporates real-time analytics, AI-powered resume assessments, an interactive candidate directory, career event pipelines, and robust platform configuration controls.

---

## 🎨 Preview & Styling Aesthetics
- **Dark Mode Default:** Out-of-the-box support for light and dark modes utilizing curated, high-contrast HSL color palettes.
- **Glassmorphic Cards:** Glassmorphic layout panels with soft shadows, subtle glowing borders, and elegant layout transitions (`.animate-fade-in`).
- **Responsive Layout:** Flexbox and grid systems ensuring mobile, tablet, and desktop compatibility.

---

## 🌟 Key Platform Features

### 👤 Student Dashboard & Resources
- **AI Resume Reviewer:** Students upload their resume PDFs and receive immediate ratings (0-100) and actionable suggestions (matched roles, content optimization tips) using Gemini API models.
- **Career Event Registrations:** Browse university placement events, workshops, and hackathons, and register/unregister dynamically.
- **Platform Profile Manager:** Build a complete professional profile, including academic background, work experiences, portfolio website links (GitHub, LinkedIn), and problem-solving details.

### 💼 Admin & Recruiter Dashboard
- **Live Pipeline Analytics:** Visual stage distributions and top cohort skill graphs using Recharts.
- **Interactive Talent Directory:** Verify student records, search profiles by skill tags, and explore full candidate profiles using an advanced portalled detailed modal.
- **Employer Partners Manager:** Register and manage hiring companies, post job openings, track hiring volume, and edit partner profiles dynamically.
- **Event Broadcaster & Organizer:** Create and manage career events, view registered candidate rosters, and broadcast notifications to all registered student screens instantly.

---

## 🛠️ Technology Stack
- **Frontend Core:** React.js (Vite environment), Lucide React (Icons), Recharts (SVG Charting).
- **Backend Core:** Node.js, Express.js (Rest API endpoints), JSON Web Token (Authentication & authorization middleware).
- **Database Engine:** MongoDB (Mongoose Schema Modeling).

---

## 📂 Project Directory Structure

```bash
ApexHire/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Express API request controllers
│   ├── middleware/         # Auth verification & multer upload middleware
│   ├── models/             # Mongoose MongoDB schemas
│   ├── routes/             # API express route maps
│   ├── server.js           # Server initialization and mount configurations
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Common Layouts (Sidebar, Navbar)
    │   ├── context/        # Auth & Notification providers
    │   ├── pages/          # Page routes (AdminDashboard, StudentDashboard, AICoach, etc.)
    │   ├── styles/         # Variables, main stylesheets, responsive frameworks
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisite Installations
- Ensure you have **Node.js** (v16+) and **MongoDB** (local or Atlas) installed.

### 2. Backend Installation & Start
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_authentication_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Installation & Start
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web platform at `http://localhost:5173`.

---

## 🔒 API Endpoints Overview

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register a new user |
| **POST** | `/api/auth/login` | Public | Authenticate a user & get token |
| **GET** | `/api/profile` | Private | Retrieve current user profile |
| **PUT** | `/api/profile` | Private | Update current user profile |
| **GET** | `/api/profile/all` | Private (Admin) | Retrieve all student profiles |
| **PUT** | `/api/profile/verify/:id` | Private (Admin) | Toggle student verification status |
| **GET** | `/api/companies` | Private (Admin) | Fetch registered recruiting partners |
| **POST** | `/api/companies` | Private (Admin) | Register a new employer partner |
| **PUT** | `/api/companies/:id` | Private (Admin) | Edit details of a recruiting partner |
| **DELETE** | `/api/companies/:id` | Private (Admin) | Remove a recruiting partner |
| **POST** | `/api/jobs` | Private (Admin) | Post a job opening |
| **POST** | `/api/events` | Private (Admin) | Create placement event listing |
| **POST** | `/api/notifications/broadcast` | Private (Admin) | Broadcast notification to student portals |
