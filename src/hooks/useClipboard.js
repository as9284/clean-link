import { useState, useCallback } from "react";

export const useClipboard = () => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = useCallback(async (text) => {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);

      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);

      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);

        return true;
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        return false;
      }
    }
  }, []);

  return {
    copySuccess,
    copyToClipboard,
  };
};
