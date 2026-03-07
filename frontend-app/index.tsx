import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/tailwind.css";
import "./styles/global.css";

// Unregister any existing service workers to prevent caching issues
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log("Service Worker unregistered");
    }
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Strict check: Only load App if path starts with /app/ or is exactly /app
const isAppShell =
  window.location.pathname === "/app" ||
  window.location.pathname.startsWith("/app/");

console.log("Current Path:", window.location.pathname);
console.log("Is App Shell:", isAppShell);

async function bootstrap() {
  if (isAppShell) {
    console.log("Bootstrapping System App...");
    const { default: App } = await import("./App");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.log("Bootstrapping Vitrine...");
    // Load Vitrine styles dynamically to avoid conflicts with App
    try {
      // Import React Router DOM first to ensure it's available
      const { RouterProvider } = await import("react-router-dom");
      const { router } = await import("./vitrine/Routes/Routes.jsx");

      // Load styles
      await import("slick-carousel/slick/slick.css");
      await import("bootstrap/dist/css/bootstrap.min.css");
      await import("bootstrap-icons/font/bootstrap-icons.css");
      await import("./vitrine/assets/main.css");
      await import("./vitrine/assets/input-fixes.css");

      root.render(
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      );
    } catch (error) {
      console.error("Failed to load Vitrine dependencies:", error);
      root.render(
        <div style={{ padding: 20, color: "red" }}>
          <h1>Error Loading Vitrine</h1>
          <pre>{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      );
    }
  }
}

bootstrap();
