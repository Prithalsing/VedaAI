# VedaAI Frontend

Next.js frontend for the AI Assessment Creator.

## Environment

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Variables:

- `NEXT_PUBLIC_API_BASE_URL` - backend API base URL
- `NEXT_PUBLIC_SOCKET_URL` - backend websocket origin
- `NEXT_PUBLIC_SERVER_URL` - backend origin used for PDF/static file links

## Development

```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Build

```bash
npm run build
npm run start
```

## Scope

- Assignment list and output screens
- Assignment creation form with validation
- Zustand state management
- Socket.io live updates for generation status
- PDF download links served from backend
