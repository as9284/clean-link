import { useTheme } from "../contexts/ThemeContext";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full theme-transition focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg active:scale-95 hover:scale-105 transition-transform duration-150"
        style={{
          color: isDarkMode ? "#fbbf24" : "#0ea5e9", // yellow for dark, blue for light
          backgroundColor: isDarkMode ? "#22223b" : "#f9fafb",
          borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
        }}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.75 15.5A6.75 6.75 0 0 1 8.5 6.25a.75.75 0 0 0-1.03-.92A9 9 0 1 0 18.67 19.53a.75.75 0 0 0-.92-1.03Z" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <g stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </g>
          </svg>
        )}
      </button>
    </div>
  );
};
