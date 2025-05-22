import React, { useState } from "react";

export const Home = () => {
  const [inputLink, setInputLink] = useState("");
  const [shortenedLink, setShortenedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shortenLink = async () => {
    if (!inputLink) {
      setError("Please enter a valid URL");
      return;
    }
    setError("");
    setShortenedLink("");
    setLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: inputLink }),
      });
      if (!response.ok) {
        throw new Error("Failed to shorten the link.");
      }
      const data = await response.json();
      setShortenedLink(data.result_url);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortenedLink) return;
    navigator.clipboard
      .writeText(shortenedLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        setCopySuccess(false);
      });
  };

  return (
    <div className="relative w-full min-h-svh m-auto flex flex-col justify-center items-center p-4 gap-4">
      <div className="w-full flex flex-col justify-center items-center select-none">
        <h1 className="text-4xl font-bold">Clean Link</h1>
        <p className="text-lg text-neutral-600 font-normal">
          Paste a link to shorten it!
        </p>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-2">
        <div className="w-full flex justify-center items-center">
          <input
            type="text"
            value={inputLink}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                shortenLink();
              }
            }}
            onChange={(e) => setInputLink(e.target.value)}
            placeholder="Enter a link"
            className="w-100 h-12 bg-neutral-100 border-2 border-neutral-100 rounded-tl-lg rounded-bl-lg shadow-md px-4 hover:bg-neutral-300 focus:bg-neutral-300 duration-200"
          />

          <button
            onClick={shortenLink}
            disabled={loading}
            className="w-20 h-12 font-medium bg-neutral-100 border-2 border-neutral-100 rounded-tr-lg rounded-br-lg cursor-pointer shadow-md hover:bg-neutral-300 focus:bg-neutral-300 duration-200"
          >
            Go
          </button>
        </div>

        {loading && (
          <div>
            <l-line-wobble
              size="80"
              stroke="5"
              bg-opacity="0.3"
              speed="1.75"
              color="black"
            ></l-line-wobble>
          </div>
        )}

        {shortenedLink && (
          <div className="absolute bottom-8 w-full flex flex-col justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href={shortenedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 text-lg underline hover:text-neutral-900 duration-200"
              >
                {shortenedLink}
              </a>
            </div>
            <button
              onClick={copyToClipboard}
              className="min-w-32 h-12 font-medium bg-neutral-100 border-2 border-neutral-100 rounded-lg cursor-pointer shadow-md hover:bg-neutral-300 focus:bg-neutral-300 duration-200"
            >
              {copySuccess ? "Copied!" : "Copy Link"}
            </button>
          </div>
        )}

        {error && <p className="text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
};
