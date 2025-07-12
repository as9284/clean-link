# Clean Link

A minimalistic and straightforward URL shortener to quickly shrink and clean up internet links using CleanURI API.

## Features

- Clean, minimalist UI
- Mobile responsive design
- Instant URL shortening
- Copy to clipboard functionality
- Error handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the project locally with both frontend and backend:

```bash
npm run dev:full
```

This will start:

- Frontend server on `http://localhost:5173`
- Backend API server on `http://localhost:3001`

### Alternative Development Commands

- Frontend only: `npm run dev`
- Backend only: `npm run server`

### Production Build

```bash
npm run build
```

## API

The backend server proxies requests to the CleanURI API and handles CORS for local development.

## Technologies Used

- React
- Vite
- Express.js
- Tailwind CSS
- CleanURI API
