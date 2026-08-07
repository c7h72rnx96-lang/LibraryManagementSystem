import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- The notification popup component
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- Our new global state
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider wraps the app so all components know who is logged in */}
      <AuthProvider>
        <App />
        {/* Toaster is placed here so it can pop up notifications over any page */}
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
