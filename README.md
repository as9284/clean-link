# Clean Link - Fast & Reliable URL Shortener

A minimal, fast, and reliable URL shortening service built with React and Vercel serverless functions.

## Features

- ⚡ **Lightning Fast**: Custom-built shortening algorithm with no external dependencies
- 🔒 **Reliable**: No external service failures or rate limits
- 🎨 **Beautiful UI**: Clean, modern interface with dark/light theme support
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 🚀 **Simple**: Easy to use with one-click copying

## How It Works

This URL shortener uses a custom implementation that:

1. **Generates Short Codes**: Creates 6-character codes using MD5 hashing and base62 encoding
2. **In-Memory Storage**: Stores URL mappings in memory for fast access
3. **Fast Lookups**: Direct mapping between short codes and original URLs
4. **No External Dependencies**: Works completely offline without relying on third-party services

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clean-link
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Deployment

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

## API Endpoints

### POST /api/shorten

Shortens a URL.

**Request:**

```json
{
  "url": "https://example.com/very-long-url"
}
```

**Response:**

```json
{
  "result_url": "https://your-domain.vercel.app/r/Ab3x9Y"
}
```

### GET /api/r/[code]

Redirects to the original URL.

**Example:** `https://your-domain.vercel.app/api/r/Ab3x9Y` redirects to the original URL.

## Technical Details

### URL Shortening Algorithm

- Uses MD5 hashing for consistent results
- Converts to base62 for shorter codes (6 characters)
- Handles collisions with random suffixes
- Supports URLs up to 2048 characters

### Storage

- In-memory storage for fast access
- Resets on cold starts (can be extended with external storage)
- No database required
- Can be enhanced with environment variables for persistence

### Performance

- Sub-millisecond shortening
- Instant redirects
- No external API calls
- Minimal memory usage

## Why This Approach?

Unlike traditional URL shorteners that rely on external services, this implementation:

- ✅ **Never Fails**: No external dependencies to break
- ✅ **Always Fast**: No network calls to third-party APIs
- ✅ **Works Offline**: Complete self-contained solution
- ✅ **No Rate Limits**: No external service restrictions
- ✅ **Privacy**: All data stays on your server

## License

MIT License - feel free to use this project for your own needs.
