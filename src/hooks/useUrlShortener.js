import { useState, useRef, useCallback } from "react";

export const useUrlShortener = () => {
  const [shortenedLink, setShortenedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestInProgress = useRef(false);
  const abortControllerRef = useRef(null);

  const shortenUrl = useCallback(async (url, retryCount = 0) => {
    if (!url?.trim()) {
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
        body: JSON.stringify({ url: url.trim() }),
        signal: abortControllerRef.current.signal,
      });

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to shorten the link.");
      }

      const data = await response.json();

      if (data.result_url) {
        setShortenedLink(data.result_url);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        // Handle timeout errors with retry logic
        if (
          err.message.includes("timeout") ||
          err.message.includes("Failed to fetch") ||
          response?.status === 504
        ) {
          if (retryCount < 2) {
            // Retry with exponential backoff
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
            setTimeout(() => {
              if (requestInProgress.current) {
                shortenUrl(url, retryCount + 1);
              }
            }, delay);
            return;
          } else {
            setError(
              "Service temporarily unavailable. Please try again in a moment."
            );
          }
        } else {
          setError(err.message || "Something went wrong. Please try again.");
        }
      }
    } finally {
      // Only reset state if this is still the current request
      if (requestInProgress.current) {
        setLoading(false);
        requestInProgress.current = false;
        abortControllerRef.current = null;
      }
    }
  }, []);

  const reset = useCallback(() => {
    setShortenedLink("");
    setError("");
    setLoading(false);
    requestInProgress.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    shortenedLink,
    error,
    loading,
    shortenUrl,
    reset,
  };
};
