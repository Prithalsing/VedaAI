# VedaAI AI Assessment Creator

An AI-powered assessment generation platform built for teachers to create assignments, trigger background question-paper generation, and review structured outputs in real time.

This project is implemented as a full-stack system with:

- `frontend/` - Next.js application
- `backend/` - Express API, BullMQ worker, WebSocket server

## Overview

The application supports this flow:

1. Teacher creates an assignment from the frontend
2. Backend stores the assignment in MongoDB
3. BullMQ pushes a generation job to Redis
4. Worker processes the job asynchronously
5. AI generates a structured paper response
6. Result is stored, PDF is generated, and frontend is updated over WebSocket

If Gemini is not configured, the system falls back to mock structured output so the rest of the product can still be tested.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Zustand
- Socket.io client

### Backend

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- Redis
- BullMQ
- Socket.io
- PDFKit
- Google Gemini SDK

## Current Features

- Assignment creation form with:
  - due date
  - question type breakdown
  - marks per question
  - additional instructions
  - optional PDF or text upload
- Client-side validation for form input
- Assignment list view
- Assignment output view with:
  - sections
  - difficulty labels
  - marks
  - PDF download link
- WebSocket-based live generation updates
- Regenerate assignment flow
- Delete assignment flow
- Mock AI fallback when no Gemini key is present

## Project Structure

```text
VedaAI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── uploads/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── stores/
└── README.md
```

## Architecture Summary

### Backend

- `Assignment` documents store teacher input and job status
- `Result` documents store generated sections and PDF URL
- BullMQ handles async generation jobs using Redis
- WebSocket rooms are keyed by assignment ID for live progress updates
- PDF files are generated under `backend/uploads`

### Frontend

- Zustand stores assignments, selected assignment, UI mode, and job feedback
- Assignment list, create form, and output view are modularized into separate components
- The dashboard reacts to WebSocket status updates without requiring manual refresh

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/veda-ai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Notes:

- `GEMINI_API_KEY` is optional for infrastructure testing
- without the key, the backend generates mock structured papers

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or remotely
- Redis running locally or in Docker

### Install Dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### Run Development Servers

Use two terminals.

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
```

### Root Scripts

From the repo root:

```bash
npm run dev:backend
npm run dev:frontend
npm run build
```

## URLs

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Generated PDFs: `http://localhost:5000/uploads/<file>.pdf`

## How To Test

### 1. Infrastructure Test

- Start MongoDB
- Start Redis
- Start backend
- Start frontend
- Create a new assignment from the UI

Expected:

- assignment saved in MongoDB
- BullMQ job added to Redis
- worker processes the job
- frontend receives real-time status updates
- output page becomes available

### 3. AI Test

To test real Gemini generation:

1. add a valid `GEMINI_API_KEY` in `backend/.env`
2. restart backend
3. submit a new assignment from the frontend

If no key is provided, mock generation is used instead.

## Sample Upload File

A sample text file for upload testing is available at:

- [backend/uploads/sample-reference-material.txt](backend/uploads/sample-reference-material.txt)

Use it to verify:

- optional file upload
- backend text extraction
- prompt enrichment using uploaded content

## Important Notes

- BullMQ completed jobs are currently removed from Redis after success by queue config
- generated PDFs are deleted when the related assignment is deleted
- frontend and backend builds currently pass

