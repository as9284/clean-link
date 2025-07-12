import React, { useState, useRef } from "react";

export const Home = () => {
  const [inputLink, setInputLink] = useState("");
  const [shortenedLink, setShortenedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const requestInProgress = useRef(false);

  const shortenLink = async (retryCount = 0) => {
    if (!inputLink) {
      setError("Please enter a valid URL");
      return;
    }

    // Prevent multiple simultaneous requests
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
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
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      
      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 400) {
          throw new Error(data.error || "Invalid URL format");
        } else if (response.status === 503 && retryCount < 2) {
          // Retry for service unavailability
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
          setTimeout(() => shortenLink(retryCount + 1), delay);
          return;
        } else if (response.status === 503) {
          throw new Error("URL shortening services are temporarily unavailable. Please try again in a moment.");
        } else {
          throw new Error(data.error || "Failed to shorten the link.");
        }
      }
      
      if (data.result_url) {
        setShortenedLink(data.result_url);
        // Add a small delay to prevent rapid successive requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      requestInProgress.current = false;
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full mb-6 sm:mb-8">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-3 sm:mb-4">
            CLEAN LINK
          </h1>
          <div className="w-16 sm:w-24 h-px bg-black mx-auto mb-4 sm:mb-6"></div>
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest">
            Minimal URL shortening
          </p>
        </div>

        {/* Main content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Input section */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center border-b-2 border-gray-200 pb-4 transition-all duration-300 focus-within:border-black">
              <input
                type="text"
                value={inputLink}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    shortenLink();
                  }
                }}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="Enter URL to shorten"
                className="flex-1 bg-transparent text-base sm:text-lg placeholder-gray-400 focus:outline-none font-light transition-all duration-300 focus:placeholder-gray-300"
              />
              <button
                onClick={shortenLink}
                disabled={loading}
                className="mt-4 sm:mt-0 sm:ml-4 px-6 sm:px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-xs sm:text-sm">SHORTENING</span>
                  </div>
                ) : (
                  "SHORTEN"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm font-light animate-fade-in">
                {error}
              </div>
            )}
          </div>

          {/* Result section */}
          {shortenedLink && (
            <div className="animate-fade-in">
              <div className="border-t border-gray-200 pt-6 sm:pt-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-black">
                    SHORTENED URL
                  </h3>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg">
                  <a
                    href={shortenedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black text-sm sm:text-lg font-light hover:text-gray-600 transition-colors duration-300 break-all"
                  >
                    {shortenedLink}
                  </a>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full py-3 sm:py-4 bg-black text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95"
                >
                  {copySuccess ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">COPIED</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">COPY LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Simple • Fast • Clean
          </p>
        </div>
      </div>
    </div>
  );
};
