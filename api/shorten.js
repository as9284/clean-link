import crypto from "crypto";

// In-memory storage for Vercel serverless functions
// Note: This will reset on each cold start, but provides fast performance
let urlStorage = {
  urls: {},
  codeToUrl: {},
};

// Try to load from environment variable if available (for persistence across deployments)
if (process.env.URL_STORAGE) {
  try {
    urlStorage = JSON.parse(process.env.URL_STORAGE);
  } catch (error) {
    console.error("Error parsing URL storage from env:", error);
  }
}

// Get storage (in-memory for Vercel)
function getStorage() {
  return urlStorage;
}

// Save storage (in-memory for Vercel)
function saveStorage(storage) {
  urlStorage = storage;
  // Optionally, you could store this in a database or external service
  // for persistence across deployments
}

// Generate a short code
function generateShortCode(url) {
  // Create a hash of the URL
  const hash = crypto.createHash("md5").update(url).digest("hex");

  // Take first 8 characters and convert to base62 for shorter codes
  const base62Chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let num = parseInt(hash.substring(0, 8), 16);
  let code = "";

  // Convert to base62 (6 characters max)
  for (let i = 0; i < 6; i++) {
    code = base62Chars[num % 62] + code;
    num = Math.floor(num / 62);
  }

  return code;
}

// Validate URL format
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Clean URL
function cleanUrl(url) {
  let cleanUrl = url.trim();

  // Add protocol if missing
  if (!cleanUrl.match(/^https?:\/\//)) {
    cleanUrl = "https://" + cleanUrl;
  }

  return cleanUrl;
}

export default async function handler(req, res) {
  // Set proper JSON content type immediately
  res.setHeader("Content-Type", "application/json");

  // Enable CORS for all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse request body
    let body = req.body;

    // If body is a string, try to parse it as JSON
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON in request body" });
      }
    }

    // Validate body
    if (!body || typeof body !== "object") {
      return res
        .status(400)
        .json({ error: "Request body must be a JSON object" });
    }

    const { url } = body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Clean and validate URL
    const cleanUrl = cleanUrl(url);

    if (!isValidUrl(cleanUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Get storage
    const storage = getStorage();

    // Check if URL already exists
    if (storage.urls[cleanUrl]) {
      const shortCode = storage.urls[cleanUrl];
      const shortUrl = `${req.headers.host}/r/${shortCode}`;
      return res.json({ result_url: shortUrl });
    }

    // Generate short code
    let shortCode = generateShortCode(cleanUrl);

    // Ensure uniqueness (handle collisions)
    let attempts = 0;
    while (storage.codeToUrl[shortCode] && attempts < 10) {
      // Add random suffix to make it unique
      const randomSuffix = Math.random().toString(36).substring(2, 4);
      shortCode = generateShortCode(cleanUrl + randomSuffix);
      attempts++;
    }

    // Store the mapping
    storage.urls[cleanUrl] = shortCode;
    storage.codeToUrl[shortCode] = cleanUrl;

    // Save to storage
    saveStorage(storage);

    // Generate short URL
    const shortUrl = `${req.headers.host}/r/${shortCode}`;

    console.log(`Successfully shortened URL: ${cleanUrl} -> ${shortUrl}`);

    return res.json({ result_url: shortUrl });
  } catch (error) {
    console.error("Error in shorten handler:", error);
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      details: error.message,
    });
  }
}
