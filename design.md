\# 🧠 System Design Document



\## Architecture Overview



Client-Server architecture using REST APIs.



Frontend (React) → Backend (Node.js/Express) → Database (PostgreSQL)



\---



\## System Components



\### Frontend



\* Login/Register pages

\* Dashboard

\* Project view

\* Task board (Kanban)



\---



\### Backend Services



\* Auth Service

\* Project Service

\* Task Service



\---



\## Database Design



\### Users



\* id (PK)

\* name

\* email (unique)

\* password

\* role



\---



\### Projects



\* id (PK)

\* name

\* created\_by (FK → Users)



\---



\### ProjectMembers



\* id (PK)

\* user\_id (FK)

\* project\_id (FK)

\* role



\---



\### Tasks



\* id (PK)

\* title

\* description

\* status

\* priority

\* deadline

\* assigned\_to (FK → Users)

\* project\_id (FK → Projects)



\---



\## API Design



\### Auth



POST /api/auth/signup

POST /api/auth/login



\---



\### Projects



POST /api/projects

GET /api/projects

POST /api/projects/:id/add-member



\---



\### Tasks



POST /api/tasks

GET /api/tasks

PATCH /api/tasks/:id

DELETE /api/tasks/:id



\---



\## Data Flow



1\. User sends request from frontend

2\. Backend validates input

3\. Business logic executed

4\. Data stored/retrieved from DB

5\. Response returned



\---



\## Security



\* JWT authentication

\* Role-based middleware

\* Input validation (Joi/Zod)



\---



\## Scalability



\* Stateless backend

\* Use caching (Redis optional)

\* Horizontal scaling possible



