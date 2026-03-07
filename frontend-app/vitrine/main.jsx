import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/Routes.jsx";
import { errorHandler } from "./utils/errorHandling.js";
import "slick-carousel/slick/slick.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/main.css";
import "./assets/input-fixes.css"; // Fixes pour la visibilité des champs de saisie

// Initialiser le gestionnaire d'erreurs global
errorHandler.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
