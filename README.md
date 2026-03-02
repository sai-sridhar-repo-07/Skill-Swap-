# SkillSwap — Peer-to-Peer Microlearning Platform

> A production-ready full-stack SaaS platform where users offer live micro-sessions, earn credits by teaching, and spend credits by learning.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion + Zustand |
| Backend | Node.js + Express + Socket.io (WebRTC signaling) |
| Database | MongoDB (sessions, users, reviews) + PostgreSQL (credit ledger) |
| Cache | Redis (trending, rate limiting) |
| Auth | JWT (access + refresh) + Bcrypt |
| Storage | AWS S3 (avatars) |
| DevOps | Docker + Docker Compose + Nginx + GitHub Actions |

## Quick Start (Local)

```bash
# 1. Clone and setup environment
cp .env.example .env
# Edit .env with your values

# 2. Start all services (Docker)
docker compose up -d

# App runs at http://localhost
# Backend API: http://localhost/api
# Health check: http://localhost/health
```

## Development (without Docker)

```bash
# Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # runs on :5000

# Frontend
cd frontend
npm install
npm run dev            # runs on :3000
```

## Project Structure

```
Skill Swap/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express + Socket.io entry
│   │   ├── config/             # DB, Redis connections
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── socket/             # WebRTC signaling
│   │   └── utils/              # Logger, helpers
│   └── migrations/             # PostgreSQL schema
├── frontend/
│   └── src/
│       ├── components/         # UI components
│       ├── pages/              # Route pages
│       ├── store/              # Zustand stores
│       ├── services/           # Axios API calls
│       └── hooks/              # Custom hooks
├── nginx/                      # Reverse proxy config
├── .github/workflows/          # CI/CD pipeline
└── docker-compose.yml
```

## Core Features

- **Authentication**: Email/password + JWT refresh token rotation
- **Credit Economy**: PostgreSQL ledger with atomic transactions, no negative balances
- **Session System**: Create, book, start, complete sessions with auto credit transfer
- **Live Video**: WebRTC peer-to-peer video with screen sharing
- **Real-time**: Socket.io for notifications, chat, and WebRTC signaling
- **Collaborative Whiteboard**: Canvas-based, synced across participants
- **Admin Panel**: User management, credit adjustments, session moderation
- **Responsive UI**: Mobile-first, dark theme, Framer Motion animations

## API Endpoints

```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login
POST   /api/auth/refresh-token   Refresh access token
GET    /api/auth/me              Get current user

GET    /api/sessions             Browse sessions (filters)
POST   /api/sessions             Create session
GET    /api/sessions/trending    Trending sessions
POST   /api/sessions/:id/book    Book session
POST   /api/sessions/:id/start   Start session (host)
POST   /api/sessions/:id/complete Complete session

GET    /api/users/teachers       Search teachers
PATCH  /api/users/me             Update profile
GET    /api/users/me/transactions Credit history

POST   /api/reviews/session/:id  Create review
GET    /api/reviews/user/:id     Get user reviews

GET    /api/admin/dashboard      Admin stats (admin only)
GET    /api/admin/users          User list (admin only)
POST   /api/admin/users/:id/credits Adjust credits
```

## Environment Variables

See `.env.example` for all required variables.

## Production Deployment

1. Provision EC2 instance (Ubuntu 22.04, t3.small+)
2. Install Docker + Docker Compose
3. Set GitHub Secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
4. Push to `main` branch → CI/CD deploys automatically
5. Configure domain and SSL certificates in `nginx/nginx.conf`

## License

MIT
