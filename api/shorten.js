import fetch from "node-fetch";

// Timeout configuration
const TIMEOUT_MS = 10000; // 10 seconds

// Create a timeout wrapper for fetch
async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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

  // Wrap everything in a try-catch to ensure we always return JSON
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Try multiple URL shortening services with better error handling
    const services = [
      {
        name: "CleanURI",
        handler: async () => {
          try {
            const formData = new URLSearchParams();
            formData.append("url", url);

            const response = await fetchWithTimeout(
              "https://cleanuri.com/api/v1/shorten",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "CleanLink/1.0",
                },
                body: formData.toString(),
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.result_url) {
                return data.result_url;
              }
            }
            throw new Error(`CleanURI failed with status: ${response.status}`);
          } catch (error) {
            throw new Error(`CleanURI error: ${error.message}`);
          }
        },
      },
      {
        name: "TinyURL",
        handler: async () => {
          try {
            const response = await fetchWithTimeout(
              `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
                url
              )}`,
              {
                headers: {
                  "User-Agent": "CleanLink/1.0",
                },
              }
            );

            if (response.ok) {
              const shortenedUrl = await response.text();
              if (shortenedUrl && !shortenedUrl.includes("Error")) {
                return shortenedUrl;
              }
            }
            throw new Error(`TinyURL failed with status: ${response.status}`);
          } catch (error) {
            throw new Error(`TinyURL error: ${error.message}`);
          }
        },
      },
      {
        name: "Is.gd",
        handler: async () => {
          try {
            const response = await fetchWithTimeout(
              `https://is.gd/create.php?format=json&url=${encodeURIComponent(
                url
              )}`,
              {
                headers: {
                  "User-Agent": "CleanLink/1.0",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.shorturl) {
                return data.shorturl;
              }
            }
            throw new Error(`Is.gd failed with status: ${response.status}`);
          } catch (error) {
            throw new Error(`Is.gd error: ${error.message}`);
          }
        },
      },
    ];

    // Try each service in parallel with individual timeouts
    const promises = services.map(async (service) => {
      try {
        const result = await service.handler();
        return { service: service.name, result };
      } catch (error) {
        return { service: service.name, error: error.message };
      }
    });

    const results = await Promise.allSettled(promises);

    // Find the first successful result
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.result) {
        return res.json({ result_url: result.value.result });
      }
    }

    // If all services failed, provide a more detailed error
    const failedServices = results
      .filter((r) => r.status === "fulfilled" && r.value.error)
      .map((r) => r.value.service);

    return res.status(503).json({
      error:
        "All URL shortening services are temporarily unavailable. Please try again in a moment.",
      details: `Failed services: ${failedServices.join(", ")}`,
    });
  } catch (error) {
    // Ensure we always return JSON, even for unexpected errors
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      details: error.message,
    });
  }
}
