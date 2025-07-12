# Clean Link

A minimal URL shortening application built with React and Express.

## Features

- Clean, minimal UI design
- URL shortening using multiple services (CleanURI + TinyURL fallback)
- Copy to clipboard functionality
- Responsive design

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Running in Development

```bash
# Run both frontend and backend
npm run dev:full

# Or run them separately:
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

### For Production Deployment

1. **Build and start the application:**

   ```bash
   npm run start
   ```

2. **For deployment platforms (Heroku, Railway, etc.):**

   - Set the `start` script as your main command
   - The server will automatically build the React app and serve it

3. **Environment Variables:**
   - `PORT`: The port your server will run on (default: 3001)
   - `NODE_ENV`: Set to `production` for production environment

### Troubleshooting Deployment Issues

If the link shortening doesn't work in production:

1. **Check server logs** for API errors
2. **Verify the API endpoints** are accessible from your deployment platform
3. **Ensure CORS is properly configured** (already handled in the code)
4. **Check if the external URL shortening services** are accessible from your deployment region

### Common Issues

- **CORS errors**: The server is configured to handle CORS for both development and production
- **API timeouts**: The app uses two different URL shortening services as fallback
- **Static file serving**: The server automatically serves the built React app

## API Endpoints

- `POST /api/shorten` - Shorten a URL
  - Body: `{ "url": "https://example.com" }`
  - Response: `{ "result_url": "https://shortened-url.com" }`

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **URL Shortening**: CleanURI API + TinyURL API (fallback)
