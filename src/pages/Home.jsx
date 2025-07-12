import React, { useState, useRef, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";

export const Home = () => {
  const [inputLink, setInputLink] = useState("");
  const [shortenedLink, setShortenedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const requestInProgress = useRef(false);
  const abortControllerRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const shortenLink = useCallback(async (retryCount = 0) => {
    if (!inputLink) {
      setError("Please enter a valid URL");
      return;
    }

    // Prevent multiple simultaneous requests
    if (requestInProgress.current) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal,
      });

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Response parsing error:", jsonError);
        console.error("Response text:", responseText);
        console.error("Content-Type:", contentType);
        console.error("Status:", response.status);
        throw new Error(
          "Server returned an invalid response. Please try again."
        );
      }

      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 400) {
          throw new Error(data.error || "Invalid URL format");
        } else if (response.status === 503 && retryCount < 2) {
          // Retry for service unavailability
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
          setTimeout(() => {
            // Only retry if we're still in the same request cycle
            if (requestInProgress.current) {
              shortenLink(retryCount + 1);
            }
          }, delay);
          return;
        } else if (response.status === 503) {
          throw new Error(
            "URL shortening services are temporarily unavailable. Please try again in a moment."
          );
        } else {
          throw new Error(data.error || "Failed to shorten the link.");
        }
      }

      if (data.result_url) {
        setShortenedLink(data.result_url);
        // Add a small delay to prevent rapid successive requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      // Only reset state if this is still the current request
      if (requestInProgress.current) {
        setLoading(false);
        requestInProgress.current = false;
        abortControllerRef.current = null;
      }
    }
  }, [inputLink]);

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

  // Cleanup function for component unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 theme-transition" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-lg sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 sm:mb-8 theme-transition" style={{ backgroundColor: 'var(--text-primary)' }}>
            <svg
              className="w-6 h-6 theme-transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--bg-primary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 sm:mb-4 theme-transition" style={{ color: 'var(--text-primary)' }}>
            CLEAN LINK
          </h1>
          <div className="w-16 sm:w-24 h-px mx-auto mb-4 sm:mb-6 theme-transition" style={{ backgroundColor: 'var(--text-primary)' }}></div>
          <p className="text-xs sm:text-sm uppercase tracking-widest theme-transition" style={{ color: 'var(--text-secondary)' }}>
            Minimal URL shortening
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full theme-transition hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              '--tw-ring-color': 'var(--text-primary)',
              '--tw-ring-offset-color': 'var(--bg-primary)'
            }}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012 21a9 9 0 009-9c0-.528-.086-1.036-.246-1.528z" />
              </svg>
            )}
          </button>
        </div>

        {/* Main content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Input section */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center border-b-2 pb-4 transition-all duration-300 focus-within:border-opacity-100 theme-transition" style={{ borderColor: 'var(--border-primary)' }}>
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
                className="flex-1 bg-transparent text-base sm:text-lg font-light transition-all duration-300 focus:outline-none theme-transition"
                style={{ 
                  color: 'var(--text-primary)',
                  '--tw-placeholder-color': 'var(--text-secondary)'
                }}
              />
              <button
                onClick={shortenLink}
                disabled={loading}
                className="mt-4 sm:mt-0 sm:ml-4 px-6 sm:px-8 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 theme-transition"
                style={{ 
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  '--tw-ring-color': 'var(--button-bg)',
                  '--tw-ring-offset-color': 'var(--bg-primary)'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-xs sm:text-sm">SHORTENING</span>
                  </div>
                ) : (
                  "SHORTEN"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 text-sm font-light animate-fade-in theme-transition" style={{ color: '#ef4444' }}>
                {error}
              </div>
            )}
          </div>

          {/* Result section */}
          {shortenedLink && (
            <div className="animate-fade-in">
              <div className="border-t pt-6 sm:pt-8 theme-transition" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium theme-transition" style={{ color: 'var(--text-primary)' }}>
                    SHORTENED URL
                  </h3>
                  <div className="w-2 h-2 rounded-full theme-transition" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                </div>

                <div className="p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg theme-transition" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <a
                    href={shortenedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-lg font-light transition-colors duration-300 break-all theme-transition"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {shortenedLink}
                  </a>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="w-full py-3 sm:py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 theme-transition"
                  style={{ 
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--button-text)',
                    '--tw-ring-color': 'var(--button-bg)',
                    '--tw-ring-offset-color': 'var(--bg-primary)'
                  }}
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
      </div>
    </div>
  );
};
