# VedaAI AI Assessment Creator

Full-stack AI assessment creator built with Next.js, Express, MongoDB, Redis, BullMQ, and Socket.io.

## Status

- Backend setup is ready
- Frontend setup is ready
- Assignment creation, list, realtime updates, and output page are wired
- Remaining work can focus on AI quality and prompt/output refinement

## Stack

- Frontend: Next.js, TypeScript, Tailwind, Zustand, Socket.io client
- Backend: Node.js, Express, TypeScript, MongoDB, Redis, BullMQ, Socket.io
- AI: Gemini structured output flow with mock fallback

## Project Structure

- `frontend/` - Next.js app
- `backend/` - Express API, websocket server, BullMQ worker

## Backend Environment

Create `backend/.env` from `backend/.env.example`.

Variables:

- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/veda-ai`
- `REDIS_HOST=127.0.0.1`
- `REDIS_PORT=6379`
- `GEMINI_API_KEY=your_key`
- `GEMINI_MODEL=gemini-2.5-flash`

If `GEMINI_API_KEY` is not set, the backend still works using mock generated papers.

## Frontend Environment

Create `frontend/.env.local` from `frontend/.env.example`.

Variables:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`
- `NEXT_PUBLIC_SERVER_URL=http://localhost:5000`

## Local Run

Use two terminals.

### Backend

```bash
npm --prefix backend install
npm --prefix backend run dev
```

### Frontend

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Root Scripts

From the repo root:

```bash
npm run dev:backend
npm run dev:frontend
npm run build
```

## Implemented Flow

1. Load assignments from MongoDB
2. Open create form
3. Submit due date, question configs, optional file, and instructions
4. Queue generation through BullMQ
5. Receive realtime websocket updates
6. Open completed generated paper and download PDF

## Notes

- MongoDB and Redis must be running before backend startup
- Generated PDFs are served from `backend/uploads`
- Frontend already uses Zustand and Socket.io as required
- The main remaining area is AI generation quality
