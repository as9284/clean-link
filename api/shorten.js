import {
  getStorage,
  saveStorage,
  generateShortCode,
  isValidUrl,
  cleanUrl,
  setCorsHeaders,
  handlePreflight,
  parseRequestBody,
} from "./utils.js";

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse and validate request body
    const body = parseRequestBody(req, res);
    if (!body) return;

    const { url } = body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Clean and validate URL
    const normalizedUrl = cleanUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Get storage
    const storage = getStorage();

    // Check if URL already exists
    if (storage.urls[normalizedUrl]) {
      const shortCode = storage.urls[normalizedUrl];
      const shortUrl = `${req.headers.host}/r/${shortCode}`;
      return res.json({ result_url: shortUrl });
    }

    // Generate short code (async) with timeout protection
    let shortCode;
    try {
      shortCode = await Promise.race([
        generateShortCode(normalizedUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Code generation timeout")), 3000)
        )
      ]);
    } catch (error) {
      console.error("Code generation failed:", error);
      return res.status(500).json({ 
        error: "Failed to generate short code. Please try again." 
      });
    }

    // Ensure uniqueness (handle collisions) - reduced attempts for speed
    let attempts = 0;
    const maxAttempts = 3; // Reduced from 10 to 3 for faster response
    while (storage.codeToUrl[shortCode] && attempts < maxAttempts) {
      // Add random suffix to make it unique
      const randomSuffix = Math.random().toString(36).substring(2, 4);
      try {
        shortCode = await Promise.race([
          generateShortCode(normalizedUrl + randomSuffix),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Code generation timeout")), 2000)
          )
        ]);
      } catch (error) {
        console.error("Collision resolution failed:", error);
        break; // Use the existing code even if collision
      }
      attempts++;
    }

    // Store the mapping
    storage.urls[normalizedUrl] = shortCode;
    storage.codeToUrl[shortCode] = normalizedUrl;

    // Save to storage
    saveStorage(storage);

    // Generate short URL
    const shortUrl = `${req.headers.host}/r/${shortCode}`;

    console.log(`Successfully shortened URL: ${normalizedUrl} -> ${shortUrl}`);

    return res.json({ result_url: shortUrl });
  } catch (error) {
    console.error("Error in shorten handler:", error);
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      details: error.message,
    });
  }
}
