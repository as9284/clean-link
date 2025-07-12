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

    // Generate short code (async)
    let shortCode = await generateShortCode(normalizedUrl);

    // Ensure uniqueness (handle collisions)
    let attempts = 0;
    const maxAttempts = 10;
    while (storage.codeToUrl[shortCode] && attempts < maxAttempts) {
      // Add random suffix to make it unique
      const randomSuffix = Math.random().toString(36).substring(2, 4);
      shortCode = await generateShortCode(normalizedUrl + randomSuffix);
      attempts++;
    }

    // If we couldn't generate a unique code after max attempts
    if (attempts >= maxAttempts) {
      return res.status(500).json({
        error: "Unable to generate unique short code. Please try again.",
      });
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
