import { useEffect } from "react";

// Replace these with your actual Tawk.to credentials
// Get them from: https://dashboard.tawk.to → Administration → Channels → Chat Widget
const TAWK_PROPERTY_ID = "YOUR_PROPERTY_ID"; // e.g., "6789abcdef1234567890abcd"
const TAWK_WIDGET_ID = "YOUR_WIDGET_ID"; // e.g., "1hijklm2n"

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      popup?: () => void;
      endChat?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  useEffect(() => {
    // Don't load if placeholder IDs are still in use
    if (TAWK_PROPERTY_ID === "YOUR_PROPERTY_ID" || TAWK_WIDGET_ID === "YOUR_WIDGET_ID") {
      console.warn(
        "TawkTo: Please replace YOUR_PROPERTY_ID and YOUR_WIDGET_ID with your actual Tawk.to credentials in src/components/layout/TawkToChat.tsx"
      );
      return;
    }

    // Check if script already exists
    if (document.getElementById("tawkto-script")) {
      return;
    }

    // Initialize Tawk_API
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Create and append the script
    const script = document.createElement("script");
    script.id = "tawkto-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById("tawkto-script");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkToChat;
