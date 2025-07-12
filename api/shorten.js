import fetch from "node-fetch";

// Timeout configuration
const TIMEOUT_MS = 20000; // 20 seconds - increased for long URLs

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
    // Parse request body - handle both parsed and raw body
    let body = req.body;

    console.log("Request body type:", typeof body);
    console.log("Request body:", body);
    console.log("Request headers:", req.headers);

    // If body is a string, try to parse it as JSON
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
        console.log("Parsed body:", body);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(400).json({ error: "Invalid JSON in request body" });
      }
    }

    // If body is still not an object, return error
    if (!body || typeof body !== "object") {
      console.error("Invalid body type:", typeof body);
      return res
        .status(400)
        .json({ error: "Request body must be a JSON object" });
    }

    const { url } = body;
    console.log("Extracted URL:", url);

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Clean and validate URL format
    let cleanUrl = url.trim();

    // Add protocol if missing
    if (!cleanUrl.match(/^https?:\/\//)) {
      cleanUrl = "https://" + cleanUrl;
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch (urlError) {
      console.error("URL parsing error:", urlError);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Ensure we have a valid hostname
    if (!parsedUrl.hostname) {
      return res.status(400).json({ error: "Invalid URL - missing hostname" });
    }

    console.log("Cleaned URL:", cleanUrl);
    console.log("Parsed URL:", parsedUrl.toString());
    console.log("URL length:", cleanUrl.length);

    // Use longer timeout for very long URLs
    const isLongUrl = cleanUrl.length > 200;
    const timeoutForUrl = isLongUrl ? 30000 : TIMEOUT_MS; // 30 seconds for long URLs
    console.log("Using timeout:", timeoutForUrl, "ms");

    // Try multiple URL shortening services with better error handling
    const services = [
      {
        name: "CleanURI",
        handler: async () => {
          try {
            const formData = new URLSearchParams();
            formData.append("url", cleanUrl);

            const response = await fetchWithTimeout(
              "https://cleanuri.com/api/v1/shorten",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "User-Agent": "CleanLink/1.0",
                },
                body: formData.toString(),
              },
              timeoutForUrl
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
                cleanUrl
              )}`,
              {
                headers: {
                  "User-Agent": "CleanLink/1.0",
                },
              },
              timeoutForUrl
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
                cleanUrl
              )}`,
              {
                headers: {
                  "User-Agent": "CleanLink/1.0",
                },
              },
              timeoutForUrl
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
      {
        name: "V.gd",
        handler: async () => {
          try {
            const response = await fetchWithTimeout(
              `https://v.gd/create.php?format=json&url=${encodeURIComponent(
                cleanUrl
              )}`,
              {
                headers: {
                  "User-Agent": "CleanLink/1.0",
                },
              },
              timeoutForUrl
            );

            if (response.ok) {
              const data = await response.json();
              if (data.shorturl) {
                return data.shorturl;
              }
            }
            throw new Error(`V.gd failed with status: ${response.status}`);
          } catch (error) {
            throw new Error(`V.gd error: ${error.message}`);
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
        console.error(`${service.name} failed:`, error.message);
        return { service: service.name, error: error.message };
      }
    });

    const results = await Promise.allSettled(promises);

    // Find the first successful result
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.result) {
        console.log(
          `Success with ${result.value.service}:`,
          result.value.result
        );
        return res.json({ result_url: result.value.result });
      }
    }

    // If all services failed, provide a more detailed error
    const failedServices = results
      .filter((r) => r.status === "fulfilled" && r.value.error)
      .map((r) => r.value.service);

    console.error("All services failed for URL:", cleanUrl);
    console.error("Failed services:", failedServices);

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
