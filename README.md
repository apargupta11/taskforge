<div align="center">

# ⚡ TaskForge

### A modern, full-stack team task management application

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Backend on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)](https://railway.app)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## 📖 Overview

**TaskForge** is a production-ready, full-stack project management platform designed for teams who want to move fast without losing control. It offers Kanban-style task tracking, role-based access control, and real-time analytics — all wrapped in a sleek, responsive UI.

> Built for students, startup teams, and developers who need a lightweight but powerful alternative to bloated project management tools.

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user **signup / login** with JWT-based session management
- Passwords hashed with **bcrypt**
- Rate limiting (200 req / 15 min per IP) via `express-rate-limit`
- HTTP security headers via **Helmet**
- Input validation using **Zod**

### 📁 Project Management
- Create, view, and delete **projects**
- Add or remove project **members**
- Assign per-project roles: **Admin** or **Member**

### ✅ Task Management
- Full **CRUD** for tasks within projects
- Task fields: `title`, `description`, `status`, `priority`, `deadline`, `assigned_to`
- **Kanban board** with drag-and-drop (powered by `@dnd-kit`)
- Filter and sort tasks by status and priority

### 📊 Dashboard & Analytics
- Live stats: total tasks, completed, overdue, and assigned
- **Analytics page** with visual breakdowns
- **Team page** for member overview

### 🛡️ Role-Based Access Control (RBAC)
| Role   | Capabilities |
|--------|-------------|
| **Admin** | Full access — manage users, projects, tasks |
| **Member** | Interact with tasks assigned to them |
| **Viewer** | Read-only access to assigned tasks |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev) | UI framework |
| [Vite 8](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [React Router DOM 7](https://reactrouter.com) | Client-side routing |
| [@dnd-kit](https://dndkit.com) | Drag-and-drop Kanban |
| [Lucide React](https://lucide.dev) | Icon library |
| [Axios](https://axios-http.com) | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| [Node.js](https://nodejs.org) + [Express 5](https://expressjs.com) | REST API server |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | Database client |
| [JSON Web Token](https://jwt.io) | Authentication |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing |
| [Zod](https://zod.dev) | Schema validation |
| [Helmet](https://helmetjs.github.io) | Security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate limiting |

### Infrastructure
| Layer | Provider |
|-------|---------|
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Frontend Hosting** | [Vercel](https://vercel.com) |
| **Backend Hosting** | [Railway](https://railway.app) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│                  Client                      │
│        React + Vite (Vercel)                │
│                                              │
│  Pages: Landing, Login, Register, Dashboard, │
│         Kanban, Analytics, Team, Settings    │
└─────────────────┬───────────────────────────┘
                  │ REST API (Axios)
                  ▼
┌─────────────────────────────────────────────┐
│                  Server                      │
│         Node.js + Express (Railway)         │
│                                              │
│  Routes:   /api/projects                    │
│            /api/tasks                       │
│            /api/users                       │
│            /api/stats                       │
│                                              │
│  Middleware: JWT Auth · CORS · Helmet        │
│              Rate Limiter · Zod Validator    │
└─────────────────┬───────────────────────────┘
                  │ Supabase JS Client
                  ▼
┌─────────────────────────────────────────────┐
│              Database                        │
│          Supabase (PostgreSQL)              │
│                                              │
│  Tables: users · projects · project_members │
│          tasks                              │
└─────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Users
users (id, name, email, password, role, created_at)

-- Projects
projects (id, name, created_by → users.id, created_at)

-- Project Members
project_members (id, user_id → users.id, project_id → projects.id, role)

-- Tasks
tasks (id, title, description, status, priority, deadline,
       assigned_to → users.id, project_id → projects.id, created_at)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- A **Supabase** project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/taskforge.git
cd taskforge
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
CLIENT_URL=http://localhost:5173
```

Start the dev server:

```bash
npm run dev
```

### 3. Set Up the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_API_URL=http://localhost:5001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Start the dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Initialize the Database

Run the SQL schema against your Supabase project:

```bash
# Via Supabase SQL Editor or psql:
psql "your-supabase-connection-string" -f server/schema.sql
```

---

## 📡 API Reference

All endpoints are prefixed with `/api` and protected by JWT (unless noted).

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/users/register` | ❌ | Register a new user |
| `POST` | `/api/users/login` | ❌ | Login and receive JWT |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects` | ✅ | List all projects for current user |
| `POST` | `/api/projects` | ✅ | Create a new project |
| `DELETE` | `/api/projects/:id` | ✅ Admin | Delete a project |
| `POST` | `/api/projects/:id/members` | ✅ Admin | Add a member to a project |
| `DELETE` | `/api/projects/:id/members/:userId` | ✅ Admin | Remove a member |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tasks` | ✅ | List tasks (filtered by role) |
| `POST` | `/api/tasks` | ✅ | Create a new task |
| `PATCH` | `/api/tasks/:id` | ✅ | Update task fields |
| `DELETE` | `/api/tasks/:id` | ✅ Admin | Delete a task |

### Stats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/stats` | ✅ | Get dashboard statistics |

---

## 🌐 Deployment

### Frontend (Vercel)

The `client/vercel.json` handles SPA routing so deep links work correctly:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set the following **Environment Variables** in your Vercel project settings:

```
VITE_API_URL=https://your-railway-backend.up.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Railway)

Set the following **Environment Variables** in your Railway service:

```
NODE_ENV=production
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-taskforge-app.vercel.app
```

---

## 📂 Project Structure

```
taskforge/
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   └── dashboard/    # Dashboard-specific widgets
│   │   ├── context/          # React context providers
│   │   ├── lib/              # Supabase client & utilities
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Team.jsx
│   │   └── services/         # Axios API service layer
│   └── vercel.json
│
└── server/                   # Backend (Node.js + Express)
    ├── config/               # DB & app configuration
    ├── controllers/          # Route handler logic
    ├── middleware/            # Auth, validation middleware
    ├── migrations/           # DB migration files
    ├── routes/               # Express route definitions
    │   ├── projects.js
    │   ├── tasks.js
    │   ├── users.js
    │   └── stats.js
    ├── schema.sql            # Full DB schema
    └── index.js              # App entry point
```

---

## 🔒 Security Highlights

- **JWT** tokens with server-side verification on every protected route
- **bcrypt** password hashing (salted, 10 rounds)
- **Helmet** sets secure HTTP headers (CSP, HSTS, etc.)
- **CORS** restricted to known origins in production
- **Rate limiting** prevents brute-force and DDoS attacks
- **Zod** schema validation on all incoming request bodies
- **RBAC middleware** enforces Admin-only operations server-side

---

## 🗺 Roadmap

- [ ] Real-time task updates via **WebSockets**
- [ ] Email notifications for task assignments and deadlines
- [ ] File attachments on tasks
- [ ] **Redis** caching for dashboard stats
- [ ] **Docker** Compose setup for local development
- [ ] Dark / Light theme toggle persistence

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Made with ❤️ by the TaskForge team

</div>
