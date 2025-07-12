import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/shorten", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

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
        return res.json(data);
      }
    } catch (cleanUriError) {
      console.log("CleanURI failed, trying TinyURL...");
    }

    // Fallback to TinyURL API
    const tinyUrlResponse = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );

    if (tinyUrlResponse.ok) {
      const shortenedUrl = await tinyUrlResponse.text();
      return res.json({ result_url: shortenedUrl });
    } else {
      throw new Error("Both URL shortening services failed");
    }
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ error: "Failed to shorten URL. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
