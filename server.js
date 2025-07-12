import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? true : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, "dist")));

app.post("/api/shorten", async (req, res) => {
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
});

// Handle React routing - serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
