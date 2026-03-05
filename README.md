# CrickArena

A comprehensive full-stack cricket club and tournament management platform with Firebase authentication, Express/MongoDB backend, and Vue 3 (Vite) frontend.

## Abstract

CrickArena is an advanced, intelligent web-based platform engineered to modernize and unify grassroots cricket management in Kerala through a scalable, role-based, and data-driven digital ecosystem. The platform functions as an end-to-end cricket operations suite that optimizes registration, scheduling, performance analytics, ticket booking, sponsorship management, and stakeholder collaboration. CrickArena replaces fragmented, paper-based processes with a centralized, cloud-enabled environment where clubs, players, coaches, sponsors, tournament organizers, and the public interact seamlessly through structured workflows and real-time information services.

The enhanced system architecture integrates automated scheduling, sponsorship management with digital agreements, ticket booking with QR code generation, and an insights-driven analytics dashboard. Administrators gain a powerful control dashboard featuring tournament lifecycle management, automated fixture generation using constraint-based algorithms, disciplinary tracking, real-time insights on participation trends, and platform-wide monitoring through analytics pipelines. Club Managers can manage multi-team rosters, transfer players between squads, manage sponsorships, submit tournament applications, and maintain verified club credentials. Coaches receive a dedicated performance intelligence module with training session planning, player skill tracking, and lineup optimization.

Players are provided with personalized development dashboards that consolidate match statistics, skill metrics, training feedback, and performance tracking. They can showcase their verified profiles to clubs and selectors, creating opportunities for transparent grassroots talent identification. Sponsors can browse opportunities, create sponsorship deals, and manage digital agreements with clubs. Public Users and cricket enthusiasts gain access to a real-time information hub offering match centers, live scorecards, automated points table generation, player rankings, and ticket booking facilities.

CrickArena is built using the MEVN stack (MongoDB–Express–Vue–Node) with modular, extensible services, Firebase-based authenticated sessions with role-based access control, encrypted communication channels (HTTPS), QR-based ticket validation, Razorpay payment integration, and robust security policies to ensure reliability and scalability.

## Tech Stack

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 5
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS 3
- **Charts**: Chart.js
- **Real-time**: Socket.IO Client for live updates
- **Authentication**: Firebase Web SDK (Email/Password, Google OAuth)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose 8
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: Firebase Admin SDK
- **Security**: Helmet, CORS, Rate Limiting, Joi Validation
- **File Uploads**: Multer
- **Email**: Nodemailer (SMTP)
- **Payments**: Razorpay
- **QR Codes**: qrcode
- **PDF Generation**: Puppeteer

## Key Features

### 🏏 Tournament Management
- Create and manage tournaments with multiple formats (League, Knockout, Groups + Knockouts)
- Automated fixture generation with constraint-based algorithms
- Real-time match updates and live scorecards
- Points table generation and standings
- Team registration and approval workflow

### 🎫 Ticket Booking System
- Interactive stadium section selection
- Multiple ticket categories with dynamic pricing
- QR code generation for ticket validation
- Email confirmation with embedded QR codes
- Real-time seat availability tracking
- Booking history and ticket management

### 🤝 Sponsorship Module
- Sponsor marketplace for opportunity discovery
- Digital sponsorship agreements with e-signatures
- Multi-tier sponsorship packages (Title, Gold, Silver, Bronze)
- Agreement PDF generation
- Payment tracking and transaction history
- Sponsor-club messaging system

### 👥 Role-Based Dashboards

| Role | Features |
|------|----------|
| **Admin** | Platform analytics, club/user management, tournament creation, ticket configuration, sponsor oversight |
| **Club Manager** | Team roster management, player/coach assignments, tournament registration, sponsorship deals, training sessions |
| **Coach** | Training session planning, player performance tracking, match lineup management, skill assessments |
| **Player** | Performance dashboard, match statistics, training feedback, profile showcase |
| **Sponsor** | Opportunity browsing, deal creation, agreement signing, payment management |

### 📊 Analytics & Insights
- **Real-time Match Analytics** with WebSocket-powered live updates
  - Win probability calculation (ML-based)
  - Match momentum tracking
  - Final score prediction with confidence intervals
  - AI-powered match insights
  - Scoring pattern analysis
- Platform-wide statistics dashboard
- Club performance metrics
- Player statistics and rankings
- Tournament participation trends
- Revenue and transaction tracking

### 💬 Communication
- In-app messaging system
- Sponsor-club negotiations
- Contact form submissions
- Email notifications

## Repository Structure

```
crickarena/
├── backend/
│   ├── server.js              # Express bootstrapping, security, routing
│   ├── routes/                # API route handlers
│   │   ├── admin.js           # Admin operations (150KB+ comprehensive)
│   │   ├── auth.js            # Authentication & session management
│   │   ├── clubs.js           # Club CRUD & management
│   │   ├── tournaments.js     # Tournament operations
│   │   ├── tickets.js         # Ticket booking & inventory
│   │   ├── sponsors.js        # Sponsor management
│   │   ├── sponsorships.js    # Sponsorship deals & opportunities
│   │   ├── agreements.js      # Digital agreement workflows
│   │   ├── coaches.js         # Coach operations
│   │   ├── players.js         # Player management
│   │   ├── matches.js         # Match operations
│   │   ├── analytics.js       # Platform analytics
│   │   ├── payments.js        # Payment processing
│   │   ├── messages.js        # Messaging system
│   │   ├── matchAnalysis.js   # Player match analysis & stats
│   │   ├── liveAnalytics.js   # Real-time match analytics API
│   │   ├── contact.js         # Contact submissions
│   │   └── users.js           # User profile operations
│   ├── models/                # Mongoose schemas (18 models)
│   │   ├── User.js            # User accounts
│   │   ├── Club.js            # Cricket clubs
│   │   ├── Tournament.js      # Tournaments
│   │   ├── Match.js           # Match details & scores
│   │   ├── Player.js          # Player profiles
│   │   ├── Coach.js           # Coach profiles
│   │   ├── Sponsor.js         # Sponsor companies
│   │   ├── SponsorshipDeal.js # Active sponsorships
│   │   ├── SponsorshipAgreement.js # Digital contracts
│   │   ├── SponsorshipOpportunity.js # Available opportunities
│   │   ├── TicketBooking.js   # Ticket purchases
│   │   ├── TicketInventory.js # Seat inventory
│   │   ├── Payment.js         # Payment records
│   │   ├── PaymentTransaction.js # Transaction logs
│   │   ├── Message.js         # Direct messages
│   │   ├── Conversation.js    # Message threads
│   │   └── ContactSubmission.js # Contact form entries
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # Firebase token verification
│   │   ├── rbac.js            # Role-based access control
│   │   ├── validation.js      # Request validation
│   │   └── agreementMiddleware.js # Agreement-specific checks
│   ├── services/              # Business logic services
│   │   ├── matchAnalytics.js  # ML algorithms for analytics
│   │   └── websocket.js       # WebSocket service (Socket.IO)
│   ├── utils/                 # Utility functions
│   │   ├── fixturesV3.js      # Fixture generation algorithms
│   │   ├── razorpay.js        # Payment gateway integration
│   │   ├── ticketEmails.js    # Ticket confirmation emails
│   │   ├── sponsorEmails.js   # Sponsor notification emails
│   │   ├── agreementPdf.js    # PDF generation
│   │   ├── statusSync.js      # Status synchronization
│   │   └── logger.js          # Logging utilities
│   └── config/                # Configuration files
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.js            # App bootstrap
│       ├── App.vue            # Root component
│       ├── router/            # Route definitions & guards
│       ├── store/             # Pinia stores (auth, etc.)
│       ├── firebase/          # Firebase client config
│       ├── pages/             # View components (59+ pages)
│       │   ├── HomePage.vue          # Landing page
│       │   ├── Login.vue             # Authentication
│       │   ├── Register.vue          # User registration
│       │   ├── AdminPanel.vue        # Admin dashboard wrapper
│       │   ├── AdminDashboard.vue    # Admin statistics
│       │   ├── AdminTournament.vue   # Tournament management
│       │   ├── ClubManagerPanel.vue  # Club dashboard wrapper
│       │   ├── ClubManagerDashboard.vue # Club overview
│       │   ├── ClubManagerPlayers.vue   # Player management
│       │   ├── ClubManagerCoaches.vue   # Coach management
│       │   ├── ClubManagerSponsorships.vue # Sponsorship deals
│       │   ├── CoachPanel.vue        # Coach dashboard
│       │   ├── PlayerPanel.vue       # Player dashboard
│       │   ├── SponsorPanel.vue      # Sponsor dashboard
│       │   ├── SponsorMarketplace.vue # Browse opportunities
│       │   ├── TournamentsList.vue   # Tournament listings
│       │   ├── TournamentDetails.vue # Tournament info & matches
│       │   ├── MatchDetails.vue      # Match details with analytics
│       │   ├── LiveMatchAnalytics.vue # Real-time analytics page
│       │   ├── TicketBooking.vue     # Ticket purchase flow
│       │   ├── MyTickets.vue         # Booked tickets
│       │   └── ...                   # Additional pages
│       ├── components/        # Reusable components
│       │   ├── Navbar.vue            # Navigation bar
│       │   ├── Messaging.vue         # Chat interface
│       │   ├── match/                # Match-specific components
│       │   │   └── LiveAnalyticsDashboard.vue # Real-time analytics UI
│       │   ├── admin/                # Admin-specific components
│       │   │   ├── AdminDashboard.vue
│       │   │   ├── AdminTournamentManagement.vue
│       │   │   ├── AdminTicketManagement.vue
│       │   │   ├── AdminClubManagement.vue
│       │   │   ├── AdminPlayerManagement.vue
│       │   │   ├── AdminCoachManagement.vue
│       │   │   ├── AdminSponsorManagement.vue
│       │   │   ├── AdminAnalytics.vue
│       │   │   └── FixtureWizard.vue
│       │   └── ...                   # Other components
│       ├── assets/            # Static assets
│       └── utils/             # Frontend utilities
└── README.md
```

## Data Models

| Model | Description |
|-------|-------------|
| **User** | User accounts with Firebase UID, roles (admin, clubManager, coach, player, sponsor, public) |
| **Club** | Cricket clubs with registration workflow, manager assignment, logo storage |
| **Tournament** | Tournament configuration, format, registration, participants |
| **Match** | Match details, teams, scores, venue, status, results |
| **Player** | Player profiles, statistics, club affiliation, skills |
| **Coach** | Coach profiles, certifications, assigned clubs |
| **Sponsor** | Sponsor company profiles, contact info |
| **SponsorshipDeal** | Active sponsorship relationships |
| **SponsorshipAgreement** | Digital contracts with e-signatures |
| **SponsorshipOpportunity** | Available sponsorship packages |
| **TicketBooking** | Ticket purchases with QR codes |
| **TicketInventory** | Stadium section configuration and availability |
| **PaymentTransaction** | Razorpay transaction records |

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
   MONGO_URI=mongodb://localhost:27017/crickarena

   # Firebase Admin (Service Account)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

   # Razorpay (for payments)
   RAZORPAY_KEY_ID=your-key-id
   RAZORPAY_KEY_SECRET=your-key-secret

   # SMTP (for emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   MAIL_FROM="CrickArena <no-reply@crickarena.com>"
   ```

3. Run the API
   ```bash
   npm run dev    # Development with watch mode
   # or
   npm start      # Production
   ```
   - API: http://localhost:4000
   - Health check: http://localhost:4000/health

## Frontend Setup

1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Configure `frontend/.env`
   ```ini
   VITE_API_BASE=http://localhost:4000/api

   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   ```

3. Run the app
   ```bash
   npm run dev
   ```
   - App: http://localhost:5173

## API Overview

Base URL: `http://localhost:4000/api`

### Authentication (`/auth`)
- `POST /session/login` - Exchange Firebase ID token for session cookie
- `POST /session/logout` - Clear session cookie
- `POST /register` - Create/Update user profile
- `GET /profile` - Get current user profile

### Clubs (`/clubs`)
- `POST /register` - Submit club registration
- `GET /my-club` - Fetch manager's club
- `PUT /my-club` - Update club details
- `GET /public` - List approved clubs
- `GET /public/:id` - Club details

### Tournaments (`/tournaments`)
- `GET /open` - Public open tournaments
- `GET /upcoming` - Upcoming/ongoing tournaments
- `GET /history` - Completed tournaments
- `GET /:id` - Tournament details
- `GET /:id/matches` - Tournament matches
- `POST /:id/register` - Register for tournament

### Tickets (`/tickets`)
- `GET /matches/:matchId/availability` - Check seat availability
- `POST /bookings` - Create booking
- `GET /my-bookings` - User's tickets
- `GET /bookings/:id/qr` - Get ticket QR code

### Sponsorships (`/sponsorships`)
- `GET /opportunities` - Available sponsorship packages
- `POST /deals` - Create sponsorship deal
- `GET /deals/my` - User's deals

### Agreements (`/agreements`)
- `POST /` - Create agreement
- `GET /:id` - Agreement details
- `POST /:id/sign` - Sign agreement
- `GET /:id/pdf` - Download agreement PDF

### Live Analytics (`/live-analytics`)
- `GET /:matchId` - Comprehensive match analytics
- `GET /:matchId/win-probability` - Win probability calculation
- `GET /:matchId/momentum` - Match momentum tracking
- `GET /:matchId/prediction` - Score prediction
- `GET /:matchId/insights` - AI-powered insights
- `GET /active/matches` - Active matches with viewer count
- `POST /:matchId/broadcast` - Manual analytics broadcast

### Admin (`/admin`)
- `GET /stats` - Platform statistics
- `GET /clubs` - All club registrations
- `PUT /clubs/:id/approve` - Approve club
- `PUT /clubs/:id/reject` - Reject club
- `POST /tournaments` - Create tournament
- `PUT /tournaments/:id/fixtures` - Generate fixtures
- Ticket management, player management, etc.

## Security & Middleware

- **CORS**: Configurable origins (comma-separated list supported)
- **Helmet**: CSP + security headers
- **Rate Limiting**: Global limiter + stricter auth limiter
- **Cookies**: HTTP-only session cookies (`secure` + `SameSite=None` in production)
- **RBAC**: Role-based access control on protected routes
- **Validation**: Joi schemas for request validation

## Role-Based Access

| Role | Access Level |
|------|--------------|
| `admin` | Full platform control |
| `clubManager` | Club-specific operations |
| `coach` | Coaching & training features |
| `player` | Player dashboard & profile |
| `sponsor` | Sponsorship features |
| `public` | Read-only public access |

## Real-Time Match Analytics

The platform includes a sophisticated real-time analytics system powered by WebSockets and machine learning:

### Features
- **Win Probability**: ML-based calculation considering runs needed, wickets, run rate, and form
- **Match Momentum**: Weighted analysis of recent overs to track match flow
- **Score Prediction**: Linear regression-based final score projection with confidence intervals
- **AI Insights**: Rule-based expert system providing contextual match analysis
- **Live Updates**: Sub-50ms latency WebSocket updates for real-time experience

### Access Analytics
1. Navigate to any live match details page
2. Click "Live Analytics" button or "Analytics" tab
3. Or visit directly: `/match/:matchId/analytics`

### Documentation
Comprehensive documentation available in `docs/`:
- `START_HERE.md` - Quick overview and setup
- `SEMINAR_DOCUMENTATION.md` - Complete technical guide
- `QUICK_START_GUIDE.md` - 5-minute setup guide
- `PRESENTATION_SLIDES_OUTLINE.md` - 35 presentation slides
- `FUTURE_TECHNOLOGIES.md` - Enhancement ideas

## Scripts

**Backend:**
```bash
npm run dev              # Development with hot reload
npm start                # Production server
npm run seed:club-managers  # Seed club manager data
node test-analytics.js   # Test analytics algorithms
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Development Tips

1. **CORS Issues**: Ensure `CORS_ORIGIN` matches your frontend URL
2. **Firebase Key**: Preserve newlines in private key; escaped `\n` is auto-normalized
3. **Production**: Use HTTPS for secure cookies with `SameSite=None`
4. **MongoDB**: Ensure MongoDB is running and `MONGO_URI` is accessible
5. **Razorpay**: Configure keys for payment testing (use test mode keys)
6. **WebSocket**: Socket.IO is configured for real-time analytics - ensure backend is running
7. **Analytics**: Install `socket.io-client` in frontend for real-time features

---

**Built with ❤️ for Kerala's grassroots cricket community**
