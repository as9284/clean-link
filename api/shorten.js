export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://cleanuri.com/api/v1/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ url: req.body.url }).toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten the link.");
      }

      const data = await response.json();
      res.status(200).json({ result_url: data.result_url });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Something went wrong. Please try again." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
