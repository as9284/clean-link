export default async function handler(req, res) {
  // Set proper JSON content type
  res.setHeader("Content-Type", "application/json");

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  res.json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers,
  });
}
