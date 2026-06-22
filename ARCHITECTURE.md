# ApexHire Portal - Technical Architecture & Developer Guide

Welcome to the ApexHire Portal. This document provides a senior-level overview of the portal's system architecture, folder structure, design conventions, and configuration workflows to ensure the codebase remains maintainable, scalable, and easy to understand for any developer.

---

## 1. System Overview
ApexHire is an AI-powered Career & Placement Portal designed for students, recruiters, and placement coordinators.
* **Frontend**: Single Page Application built with **React**, **React Router DOM v7**, and **Vite** for optimized HMR builds. Styling is powered by custom **Vanilla CSS variables** and responsive layout grids.
* **Backend**: **Node.js** REST API built with **Express**, utilizing **Mongoose** (MongoDB) for object modeling, and integrating the **Google Gemini API** (`@google/generative-ai`) for AI-driven mock interviews, resume matching, and career coaching.

---

## 2. Directory & Folder Structure

Below is the modular architectural layout of the repository:

```
AccioBuild/
├── backend/                        # MVC REST API
│   ├── config/                     # Configuration (database connection, etc.)
│   ├── controllers/                # Business & database transaction controllers
│   ├── middleware/                 # Request filtration (auth guards, multer file upload)
│   ├── models/                     # Mongoose schemas & data validation
│   ├── routes/                     # Router endpoint mappings
│   ├── uploads/                    # Local storage directory for student resumes
│   └── server.js                   # Application entry point & route mounts
│
├── frontend/                       # React SPA
│   ├── src/
│   │   ├── assets/                 # Static media and images
│   │   ├── components/             # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── context/                # React state contexts (AuthContext, NotificationContext)
│   │   ├── pages/                  # Route-level view components (Dashboards, Job Board, Forums)
│   │   ├── styles/                 # Modular stylesheets (main.css, responsive.css)
│   │   ├── App.jsx                 # Routing configuration & layout container
│   │   └── main.jsx                # DOM mounting & app initialization
│   │
│   ├── package.json                # Project dependencies and Vite build scripts
│   └── vite.config.js              # Vite compiler configuration
│
└── ARCHITECTURE.md                 # System architecture documentation (this file)
```

---

## 3. Backend Architecture Design Patterns

### 3.1 Model-View-Controller (MVC) Flow
1. **Routes (`/backend/routes/*` )**: Define endpoints, declare HTTP verbs, and bind middleware chain.
2. **Middleware (`/backend/middleware/*` )**: Verify JSON Web Tokens (`authMiddleware.js`), extract roles (`admin`), and handle multi-part uploads (`uploadMiddleware.js`).
3. **Controllers (`/backend/controllers/*` )**: Extract request parameters, execute query logic, handle Gemini API transactions, and return structured JSON.
4. **Models (`/backend/models/*` )**: Represent MongoDB collections, declare indexes, and configure field validations.

### 3.2 Key Backend Conventions
* **Asynchronous Operations**: Controllers utilize the standard `async/await` syntax wrapped in `try/catch` blocks.
* **Error Handling**: Custom error middleware formats backend crashes into clean JSON responses `{ message: error.message }` with descriptive HTTP status codes.
* **JSON Web Tokens (JWT)**: Security is enforced via bearer tokens passed in the `Authorization` header.

---

## 4. Frontend Architecture Design Patterns

### 4.1 Global State Management
* **AuthContext (`/frontend/src/context/AuthContext.jsx` )**: Declares `user` session state, handles login/logout transactions, manages local storage hydration, and exports the `API_BASE` variable.
* **NotificationContext (`/frontend/src/context/NotificationContext.jsx` )**: Manages the portal's global toast notification overlay system.

### 4.2 Reusable CSS Variable Design System
The visual styling of the portal is configured globally using CSS variables inside variables.css:
* **Colors**: tailored HSL variables supporting dual-themes.
  * Dark mode (Default): `body`
  * Light mode: `body.light-theme`
* **Typography**: Outfit Google Font loaded via `@import`.
* **Elevated Cards**: `.glass-card` uses `backdrop-filter` and transparent borders for a sleek SaaS aesthetic.

---

## 5. Coding Best Practices for Team Members

When writing new features, follow these guidelines to preserve readability:

### 5.1 Route Definitions
Always write descriptive JSDoc comments above endpoints to explain access controls:
```javascript
/**
 * @desc    Generate mock interview questions via Gemini AI
 * @route   POST /api/ai/generate-interview
 * @access  Private (Student)
 */
router.post('/generate-interview', protect, generateInterview);
```

### 5.2 Responsive CSS Overrides
Do not write hardcoded widths (e.g. `width: 400px`) inside page inline styles. Instead, use:
* Bootstrap-like flexbox rows (`.row`, `.col-md-6`) for grids.
* Media queries inside responsive.css for custom breakpoints (Tablet `<= 992px`, Mobile `<= 768px`, Tiny Mobile `<= 480px`).

### 5.3 Fetch Request Formatting
Always specify proper content headers and catch network failures cleanly:
```javascript
const res = await fetch(`${API_BASE}/community/alumni`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...authHeader()
  },
  body: JSON.stringify(payload)
});
if (!res.ok) {
  const errData = await res.json();
  throw new Error(errData.message || 'Action failed');
}
```
