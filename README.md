# CrickArena

A full‑stack cricket club and tournaments platform with Firebase authentication, an Express/MongoDB backend, and a Vue 3 (Vite) frontend.

## Abstract
CrickArena is an advanced, intelligent web-based platform engineered to modernize and unify grassroots cricket management in Kerala through a scalable, role-based, and data-driven digital ecosystem. The platform expands beyond basic administrative digitization to function as an end-to-end cricket operations suite that optimizes registration, scheduling, performance analytics, and stakeholder collaboration. CrickArena aims to replace fragmented, paper-based processes with a centralized, cloud-enabled environment where clubs, players, coaches, tournament organizers, and the public interact seamlessly through structured workflows and real-time information services.

The enhanced system architecture broadens the platform’s capabilities by integrating predictive analytics, automated scheduling, and an insights-driven decision support engine. Administrators gain a powerful control dashboard featuring tournament lifecycle management, automated fixture generation using constraint-based algorithms, disciplinary tracking, real-time insights on participation trends, and platform-wide monitoring through analytics pipelines. Club Managers can manage multi-team rosters, transfer players between squads, track club finances, submit tournament applications, and maintain verified club credentials. Coaches receive a dedicated performance intelligence module with training session planning, individualized skill-progress heatmaps, injury monitoring, and AI-assisted lineup optimization that ensures compliant team balance.

Players are provided with personalized development dashboards that consolidate match statistics, skill metrics, training feedback, and longitudinal performance graphs generated through in-app analytics. They can showcase their verified profiles to clubs and selectors, creating opportunities for transparent grassroots talent identification. Public Users and cricket enthusiasts gain access to a real-time information hub offering match centers, live scorecards, automated points table generation, player rankings, and a social engagement layer that enables followers, comments, and club updates.

CrickArena incorporates machine learning and data engineering components to elevate the system from a management platform to an intelligent cricket analytics environment. Key additions include automated performance evaluation models, anomaly detection for fraudulent score entries, player potential prediction using historical data, and recommendation engines for training focus areas. The platform is built using the MongoDB–Express–Vue–Node stack with modular, extensible services, Firebase-based authenticated sessions with role-based access control, encrypted communication channels (HTTPS), and robust access policies to ensure security, reliability, and scalability.

This final-year project not only delivers a robust digital governance system for local cricket ecosystems but also demonstrates applied research in sports analytics, automated administration, and intelligent workflow design. By bridging technology with grassroots sports development, CrickArena positions itself as a sustainable digital infrastructure capable of supporting Kerala’s community cricket ecosystem at scale.

## Tech Stack
- **Frontend**: Vue 3, Vite, Pinia, Vue Router, Tailwind CSS
- **Auth (Web)**: Firebase Web SDK (Email/Password, Google), session cookies to backend
- **Backend**: Node.js, Express 5, Mongoose (MongoDB), Firebase Admin, Helmet, CORS, Rate limiting, Joi validation
- **Database**: MongoDB
- **Email**: Nodemailer (SMTP) — currently reserved for future use

## Repository Structure
```
crickarena/
├─ backend/
│  ├─ server.js              # Express bootstrapping, security, routing
│  ├─ routes/                # auth, users, clubs, tournaments, admin
│  ├─ models/                # User, Club, Tournament, Match
│  ├─ middleware/            # auth (Firebase), rbac, validation
│  ├─ config/                # db, firebaseAdmin, mailer
│  └─ utils/logger.js        # logger + error handler
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ .env                   # Vite app env (example included)
│  └─ src/
│     ├─ main.js             # App bootstrap + auth init
│     ├─ router/             # Route guards (auth/admin/clubManager)
│     ├─ store/auth.js       # Firebase auth, API session cookie, profile
│     ├─ firebase/client.js  # Firebase client initialization
│     ├─ pages/              # Views
│     └─ assets/, components/, utils/
└─ README.md (this file)
```

## Backend Setup
1. Install dependencies
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env`
   ```ini
   # Server
   NODE_ENV=development
   PORT=4000
   CORS_ORIGIN=http://localhost:5173

   # MongoDB
   MONGO_URI=mongodb://localhost:27017

   # Firebase Admin (Service Account)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
   # You can paste the raw PEM or a base64 body with \n newlines; code normalizes both
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   # SMTP (optional, for future email features)
   SMTP_HOST=localhost
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   MAIL_FROM="CrickArena <no-reply@crickarena.local>"
   ```
3. Run the API
   ```bash
   npm run dev
   # API: http://localhost:4000
   # Health check: http://localhost:4000/health
   ```

### Security and Middleware
- **CORS**: Only origins in `CORS_ORIGIN` are allowed (comma‑separated list supported)
- **Helmet**: Basic CSP + security headers
- **Rate Limiting**: Global limiter and stricter limiter for auth routes
- **Cookies**: Session cookie `session` (HTTP‑only; `secure`+`SameSite=None` in production)

## Frontend Setup
1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```
2. Configure `frontend/.env` (example present in repo)
   ```ini
   VITE_API_BASE=http://localhost:4000/api

   VITE_FIREBASE_API_KEY=...your...
   VITE_FIREBASE_AUTH_DOMAIN=...your...
   VITE_FIREBASE_PROJECT_ID=...your...
   VITE_FIREBASE_APP_ID=...your...
   VITE_FIREBASE_STORAGE_BUCKET=...your...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...your...
   ```
3. Run the app
   ```bash
   npm run dev
   # App: http://localhost:5173
   ```

## Authentication Flow
- Frontend uses Firebase Web Auth (Google or Email/Password).
- After sign‑in, frontend obtains ID token and calls `POST /api/auth/session/login` to create a secure session cookie.
- Backend verifies session cookie or bearer token on protected routes.

## Data Models (simplified)
- **User**: `{ firebaseUid, name, email, role: 'admin'|'clubManager'|'public', club?, emailVerified }`
- **Club**: Registration fields (clubName, district, city, contact, etc.), status workflow (`pending|approved|rejected`), logo (binary or URL), manager relation
- **Tournament**: `{ name, description, format, status, startDate, endDate, maxTeams, registrationDeadline, organizer, participants[], registrations[] }`
- **Match**: `{ tournament, homeClub, awayClub, date, time, venue, result }`

## API Overview
Base URL: `http://localhost:4000/api`

- **Auth** (`/auth`)
  - `POST /session/login` → Exchange Firebase ID token for session cookie
  - `POST /session/logout` → Clear session cookie
  - `POST /register` → Create/Update user profile (requires valid Firebase token; blocks disposable emails; validates input)
  - `GET /profile` → Get current user profile

- **Users** (`/users`)
  - `GET /me` → Current user (protected)
  - `PUT /me` → Update profile (protected)

- **Clubs** (`/clubs`)
  - `POST /register` → Submit club registration (role: clubManager)
  - `GET /my-club` → Fetch manager’s club
  - `PUT /my-club` → Update club; if approved, transitions back to pending for re‑approval
  - `GET /public` → List approved clubs (public)
  - `GET /public/:id` → Approved club details (public)
  - `GET /:id/logo` → Serve logo binary (if stored)
  - Admin legacy: `PUT /:id/approve`, `PUT /:id/reject`

- **Tournaments** (`/tournaments`)
  - `GET /open` → Public open tournaments
  - `GET /upcoming` → Upcoming/ongoing
  - `GET /history` → Completed
  - `GET /:id` → Details
  - `GET /:id/matches` → Matches
  - Club manager: `GET /mine`, `POST /:id/register`

- **Admin** (`/admin`) — role: admin
  - `GET /clubs` → List club registrations (optional `?status=`)
  - `GET /stats` → Aggregated stats
  - `PUT /clubs/:id/approve` / `PUT /clubs/:id/reject` → Moderate registrations
  - Tournaments: `POST /tournaments`, `GET /tournaments`, `PUT /tournaments/:id`, `PUT /tournaments/:id/cancel`, `GET /tournaments/:id/registrations`, `PUT /tournaments/:id/registrations/:regId/:action`

## Role‑Based Access
- Roles: `public`, `clubManager`, `admin` (stored on User model)
- Frontend route guards ensure only authorized roles reach admin/club manager pages.
- Backend enforces with `verifyFirebaseToken` + `requireRole` middleware.

## Development Tips
- If CORS errors occur, set `CORS_ORIGIN=http://localhost:5173` (or your dev URL) and restart the backend.
- For Firebase Admin private key, preserve newlines. If using env with escaped `\n`, the backend normalizes it.
- In production, use HTTPS so `secure` cookies work with `SameSite=None`.
- Ensure MongoDB is running and `MONGO_URI` is reachable.

## Scripts
- Backend: `npm run dev` (watch), `npm start`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Notes
- OTP flow is removed for registration; email transport is kept for future features.
- Some legacy fields are kept for backward compatibility (e.g., `Club.name`, `Tournament.date`, `participants`).

## Missing Repo Metadata (Optional)
The helper file `.zencoder/rules/repo.md` is not present. Creating it enables richer automated assistance for future maintenance. If you want, I can generate it based on this analysis.
