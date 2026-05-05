\# 📌 Product Requirements Document (PRD)



\## Product Name



TaskForge – Team Task Manager



\---



\## Objective



Build a full-stack web application where teams can:



\* Create projects

\* Assign tasks

\* Track progress

\* Manage roles (Admin / Member)



\---



\## Target Users



\* Students working on group projects

\* Startup teams

\* Developers collaborating on tasks



\---



\## Core Features



\### 1. Authentication



\* User signup/login

\* JWT-based authentication

\* Secure password storage (bcrypt)



\---



\### 2. Project Management



\* Create and delete projects

\* Add/remove members

\* Assign roles (Admin / Member)



\---



\### 3. Task Management



\* Create, update, delete tasks

\* Assign tasks to users

\* Task fields:



&#x20; \* Title

&#x20; \* Description

&#x20; \* Status (Todo, In Progress, Done)

&#x20; \* Priority (Low, Medium, High)

&#x20; \* Deadline



\---



\### 4. Dashboard



\* Total tasks

\* Completed tasks

\* Overdue tasks

\* Assigned tasks



\---



\### 5. Role-Based Access Control



\* Admin:



&#x20; \* Full access (manage users, projects, tasks)

\* Member:



&#x20; \* Can only interact with assigned tasks



\---



\## User Stories



\* User can register and login

\* Admin can create project and add members

\* Admin can assign tasks

\* Member can update task status

\* User can view dashboard insights



\---



\## Non-Functional Requirements



\* Fast response time (<200ms)

\* Secure authentication

\* Responsive UI (mobile + desktop)

\* Scalable backend



\---



\## Success Metrics



\* Task completion rate

\* Active users per project

\* API response time



