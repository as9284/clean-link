# Clean Link

A minimal URL shortening application built with React and Vercel serverless functions.

## Features

- Clean, minimal UI design
- URL shortening using multiple services (CleanURI + TinyURL + Is.gd fallback)
- Copy to clipboard functionality
- Responsive design
- Deployed on Vercel with serverless API

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
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

### Vercel Deployment

This app is configured for Vercel deployment with serverless functions.

1. **Install Vercel CLI (optional):**

   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel:**

   ```bash
   vercel
   ```

3. **Or connect your GitHub repository to Vercel:**
   - Push your code to GitHub
   - Connect your repository in the Vercel dashboard
   - Vercel will automatically deploy on every push

### Project Structure

- `api/shorten.js` - Serverless function for URL shortening
- `src/` - React frontend code
- `package.json` - Build configuration

### Environment Variables

No environment variables are required for basic functionality.

### Troubleshooting Vercel Deployment

If you encounter issues:

1. **Check Vercel function logs** in the Vercel dashboard
2. **Verify the API endpoint** is accessible at `/api/shorten`
3. **Ensure the build process** completes successfully

### Common Vercel Issues

- **Function timeouts**: The serverless function has a timeout limit
- **Cold starts**: First request might be slower
- **API rate limits**: External services might have rate limits

## API Endpoints

- `POST /api/shorten` - Shorten a URL
  - Body: `{ "url": "https://example.com" }`
  - Response: `{ "result_url": "https://shortened-url.com" }`

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Vercel serverless functions
- **URL Shortening**: CleanURI API + TinyURL API + Is.gd API (fallback)
- **Deployment**: Vercel
