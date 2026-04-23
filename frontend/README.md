# VioletDB Frontend

Web dashboard for VioletDB - manage collections and query embeddings visually.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16
- **UI Library**: [React](https://react.dev/) 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Components**: [Radix UI](https://radix-ui.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Features

- **Collections Manager**: Create, view, and delete vector collections
- **Semantic Search**: Query text embeddings with visual results
- **Image Embedding**: Upload and embed images using CLIP
- **Recommendation Engine**: Find similar items based on vector similarity
- **API Docs**: Interactive API documentation viewer
- **Live Logs**: Real-time request/response logging

## Project Structure

```
frontend/
├── app/
│   ├── api/          # API routes (Next.js → VioletDB proxy)
│   ├── components/   # React components
│   └── pages/        # Next.js pages
└── lib/              # Utilities
```