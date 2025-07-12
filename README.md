# Clean Link

Fast, reliable URL shortener built with React and Vercel.

## Features

- ⚡ Lightning fast shortening
- 🔒 No external dependencies
- 🎨 Dark/light theme
- 📱 Responsive design

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Deploy

```bash
npm run build
vercel
```

## API

- `POST /api/shorten` - Shorten URL
- `GET /api/r/[code]` - Redirect to original URL

## Tech

- React + Vite
- Vercel serverless functions
- Web Crypto API
- Tailwind CSS
