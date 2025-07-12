// In-memory storage for Vercel serverless functions
// Note: This will reset on each cold start, but provides fast performance
let urlStorage = {
  urls: {},
  codeToUrl: {},
};

// Try to load from environment variable if available (for persistence across deployments)
// eslint-disable-next-line no-undef
if (typeof process !== "undefined" && process.env.URL_STORAGE) {
  try {
    // eslint-disable-next-line no-undef
    urlStorage = JSON.parse(process.env.URL_STORAGE);
  } catch (error) {
    console.error("Error parsing URL storage from env:", error);
  }
}

/**
 * Get the current storage object
 * @returns {Object} The current URL storage
 */
export function getStorage() {
  return urlStorage;
}

/**
 * Save storage (in-memory for Vercel)
 * @param {Object} storage - The storage object to save
 */
export function saveStorage(storage) {
  urlStorage = storage;
  // Optionally, you could store this in a database or external service
  // for persistence across deployments
}

/**
 * Generate a short code from a URL using Web Crypto API (async)
 * @param {string} url - The URL to generate a code for
 * @returns {Promise<string>} A 6-character base62 code
 */
export async function generateShortCode(url) {
  try {
    // Use a faster approach with SHA-1 instead of SHA-256 for better performance
    const encoder = new TextEncoder();
    const data = encoder.encode(url);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Take first 6 characters for a shorter, faster code
    const base62Chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let num = parseInt(hashHex.substring(0, 6), 16);
    let code = "";

    // Generate 5-character code for better performance
    for (let i = 0; i < 5; i++) {
      code = base62Chars[num % 62] + code;
      num = Math.floor(num / 62);
    }

    return code;
  } catch (error) {
    // Fallback to a simple hash if crypto.subtle fails
    console.warn("Web Crypto API failed, using fallback:", error);
    return generateFallbackCode(url);
  }
}

/**
 * Fallback code generation using simple string manipulation
 * @param {string} url - The URL to generate a code for
 * @returns {string} A 5-character code
 */
function generateFallbackCode(url) {
  const base62Chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let hash = 0;

  // Simple hash function
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to base62
  let code = "";
  const absHash = Math.abs(hash);
  for (let i = 0; i < 5; i++) {
    code = base62Chars[absHash % 62] + code;
    hash = Math.floor(absHash / 62);
  }

  return code;
}

/**
 * Validate if a URL has a valid format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Clean and normalize a URL
 * @param {string} url - The URL to clean
 * @returns {string} The cleaned URL
 */
export function cleanUrl(url) {
  let normalizedUrl = url.trim();
  // Add protocol if missing
  if (!normalizedUrl.match(/^https?:\/\//)) {
    normalizedUrl = "https://" + normalizedUrl;
  }
  return normalizedUrl;
}

/**
 * Set CORS headers for API responses
 * @param {Object} res - Express response object
 */
export function setCorsHeaders(res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Handle preflight requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} True if preflight was handled, false otherwise
 */
export function handlePreflight(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Parse and validate request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object|null} Parsed body or null if invalid
 */
export function parseRequestBody(req, res) {
  let body = req.body;
  // If body is a string, try to parse it as JSON
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Invalid JSON in request body" });
      return null;
    }
  }
  // Validate body
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Request body must be a JSON object" });
    return null;
  }
  return body;
}
