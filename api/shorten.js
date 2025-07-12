import fetch from "node-fetch";

export default async function handler(req, res) {
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

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`Attempting to shorten URL: ${url}`);

    // Try CleanURI first
    try {
      const formData = new URLSearchParams();
      formData.append("url", url);

      const response = await fetch("https://cleanuri.com/api/v1/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("CleanURI successful:", data);
        return res.json(data);
      } else {
        console.log(`CleanURI failed with status: ${response.status}`);
      }
    } catch (cleanUriError) {
      console.log("CleanURI failed:", cleanUriError.message);
    }

    // Fallback to TinyURL API
    console.log("Trying TinyURL as fallback...");
    const tinyUrlResponse = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );

    if (tinyUrlResponse.ok) {
      const shortenedUrl = await tinyUrlResponse.text();
      console.log("TinyURL successful:", shortenedUrl);
      return res.json({ result_url: shortenedUrl });
    } else {
      console.log(`TinyURL failed with status: ${tinyUrlResponse.status}`);
      throw new Error("Both URL shortening services failed");
    }
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ error: "Failed to shorten URL. Please try again." });
  }
}
