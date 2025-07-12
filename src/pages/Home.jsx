import { useState, useEffect } from "react";
import { useUrlShortener } from "../hooks/useUrlShortener";
import { useClipboard } from "../hooks/useClipboard";
import { ThemeToggle } from "../components/ThemeToggle";

export const Home = () => {
  const [inputLink, setInputLink] = useState("");
  const { shortenedLink, error, loading, shortenUrl, reset } =
    useUrlShortener();
  const { copySuccess, copyToClipboard } = useClipboard();

  const handleShorten = () => {
    shortenUrl(inputLink);
  };

  const handleCopy = () => {
    copyToClipboard(shortenedLink);
  };

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 theme-transition"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-lg sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 sm:mb-8 theme-transition"
            style={{ backgroundColor: "var(--text-primary)" }}
          >
            <svg
              className="w-6 h-6 theme-transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--bg-primary)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight mb-3 sm:mb-4 theme-transition"
            style={{ color: "var(--text-primary)" }}
          >
            CLEAN LINK
          </h1>
          <div
            className="w-16 sm:w-24 h-px mx-auto mb-4 sm:mb-6 theme-transition"
            style={{ backgroundColor: "var(--text-primary)" }}
          ></div>
          <p
            className="text-xs sm:text-sm uppercase tracking-widest theme-transition"
            style={{ color: "var(--text-secondary)" }}
          >
            Minimal URL shortening
          </p>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Main content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Input section */}
          <div className="relative">
            <div
              className="flex flex-col sm:flex-row sm:items-center border-b-2 pb-4 transition-all duration-300 focus-within:border-opacity-100 theme-transition"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <input
                type="text"
                value={inputLink}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleShorten();
                  }
                }}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="Enter URL to shorten"
                className="flex-1 bg-transparent text-base sm:text-lg font-light transition-all duration-300 focus:outline-none theme-transition px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-900 overflow-x-auto whitespace-nowrap min-w-0"
                style={{
                  color: "var(--text-primary)",
                  backgroundColor: "var(--input-bg, transparent)",
                  '--tw-placeholder-color': 'var(--text-secondary)',
                  fontSize: '1.1rem',
                  maxWidth: '100%',
                }}
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={handleShorten}
                disabled={loading}
                className="mt-4 sm:mt-0 sm:ml-4 px-6 sm:px-8 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 theme-transition"
                style={{
                  backgroundColor: "var(--button-bg)",
                  color: "var(--button-text)",
                  "--tw-ring-color": "var(--button-bg)",
                  "--tw-ring-offset-color": "var(--bg-primary)",
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
              <div
                className="mt-4 text-sm font-light animate-fade-in theme-transition"
                style={{ color: "#ef4444" }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Result section */}
          {shortenedLink && (
            <div className="animate-fade-in">
              <div
                className="border-t pt-6 sm:pt-8 theme-transition"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3
                    className="text-base sm:text-lg font-medium theme-transition"
                    style={{ color: "var(--text-primary)" }}
                  >
                    SHORTENED URL
                  </h3>
                  <div
                    className="w-2 h-2 rounded-full theme-transition"
                    style={{ backgroundColor: "var(--text-primary)" }}
                  ></div>
                </div>

                <div
                  className="p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg theme-transition"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <a
                    href={shortenedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-lg font-light transition-colors duration-300 break-all theme-transition"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {shortenedLink}
                  </a>
                </div>

                <button
                  onClick={handleCopy}
                  className="w-full py-3 sm:py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 theme-transition"
                  style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--button-text)",
                    "--tw-ring-color": "var(--button-bg)",
                    "--tw-ring-offset-color": "var(--bg-primary)",
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
