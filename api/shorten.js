export default async function handler(req, res) {
  const url = "https://cleanuri.com" + req.url.replace("/api", "");

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method === "POST" ? req.body : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
