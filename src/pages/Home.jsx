import React, { useState } from "react";
import "ldrs/lineWobble";

export const Home = () => {
  const [inputLink, setInputLink] = useState("");
  const [shortenedLink, setShortenedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full min-h-dvh m-auto flex flex-col justify-center items-center p-4 gap-2">
      <div className="w-full flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold">Clean Link</h1>
        <p className="text-base font-medium">Paste a link to shorten it!</p>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-4">
        <div className="w-full flex justify-center items-center">
          <input
            type="text"
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            placeholder="Enter a link"
            className="w-[25rem] h-12 bg-neutral-900 border-2 border-neutral-800 rounded-tl-lg rounded-bl-lg outline-none px-4"
          />

          <button
            onClick={shortenLink}
            disabled={loading}
            className="w-20 h-12 bg-blue-800 rounded-tr-lg rounded-br-lg hover:bg-blue-900 focus:bg-blue-900 duration-200"
          >
            Start
          </button>
        </div>

        {loading && (
          <div>
            <l-line-wobble
              size="80"
              stroke="5"
              bg-opacity="0.3"
              speed="1.75"
              color="white"
            ></l-line-wobble>
          </div>
        )}

        {shortenedLink && (
          <div className="w-full flex justify-center items-center gap-2">
            <p className="text-lg">Result:</p>
            <div className="flex items-center gap-2">
              <a
                href={shortenedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 text-lg underline hover:text-blue-800 duration-200"
              >
                {shortenedLink}
              </a>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
};
