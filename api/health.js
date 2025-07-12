import fetch from "node-fetch";

const TIMEOUT_MS = 5000; // 5 seconds for health checks

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
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const services = [
    {
      name: "CleanURI",
      url: "https://cleanuri.com/api/v1/shorten",
      method: "POST",
      body: "url=https://example.com",
    },
    {
      name: "TinyURL",
      url: "https://tinyurl.com/api-create.php?url=https://example.com",
      method: "GET",
    },
    {
      name: "Is.gd",
      url: "https://is.gd/create.php?format=json&url=https://example.com",
      method: "GET",
    },
  ];

  const healthChecks = await Promise.allSettled(
    services.map(async (service) => {
      const startTime = Date.now();
      try {
        const options = {
          method: service.method,
          headers: {
            "User-Agent": "CleanLink/1.0",
          },
        };

        if (service.body) {
          options.headers["Content-Type"] = "application/x-www-form-urlencoded";
          options.body = service.body;
        }

        const response = await fetchWithTimeout(service.url, options);
        const responseTime = Date.now() - startTime;

        return {
          service: service.name,
          status: response.ok ? "healthy" : "unhealthy",
          responseTime,
          statusCode: response.status,
        };
      } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
          service: service.name,
          status: "error",
          responseTime,
          error: error.message,
        };
      }
    })
  );

  const results = healthChecks.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        service: services[index].name,
        status: "error",
        responseTime: 0,
        error: result.reason?.message || "Unknown error",
      };
    }
  });

  const healthyServices = results.filter((r) => r.status === "healthy").length;
  const totalServices = results.length;

  res.json({
    timestamp: new Date().toISOString(),
    overall: {
      status: healthyServices > 0 ? "operational" : "degraded",
      healthyServices,
      totalServices,
    },
    services: results,
  });
}
