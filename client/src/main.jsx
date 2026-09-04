import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- The notification popup component
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- Our new global state
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./app.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider wraps the app so all components know who is logged in */}
      <AuthProvider>
        <App />
        {/* Toaster is placed here so it can pop up notifications over any page */}
        {/* Replace your existing <Toaster /> with this beautifully styled one */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b", // Dark slate background
              color: "#fff", // White text
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
