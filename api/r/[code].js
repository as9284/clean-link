import { getStorage, setCorsHeaders, handlePreflight } from "../utils.js";

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handlePreflight(req, res)) {
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
