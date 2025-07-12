// In-memory storage for Vercel serverless functions
let urlStorage = {
  urls: {},
  codeToUrl: {},
};

// Try to load from environment variable if available
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

export default async function handler(req, res) {
  // Set proper headers
  res.setHeader("Content-Type", "application/json");

  // Enable CORS for all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract the short code from the URL
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Short code is required" });
    }

    // Get storage
    const storage = getStorage();

    // Look up the original URL
    const originalUrl = storage.codeToUrl[code];

    if (!originalUrl) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Redirect to the original URL
    res.redirect(301, originalUrl);
  } catch (error) {
    console.error("Error in redirect handler:", error);
    return res.status(500).json({
      error: "An unexpected error occurred.",
      details: error.message,
    });
  }
}
