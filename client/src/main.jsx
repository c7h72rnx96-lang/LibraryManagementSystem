import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { queryClient } from "./lib/queryClient.js";
import { SocketProvider } from "./context/SocketContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./app.css";
import App from "./App.jsx";

// Standardized fallback UI for unexpected render errors
const GlobalErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="container mt-5 text-center text-white p-5 rounded-4 bg-dark border border-secondary shadow-lg">
    <h2 className="text-danger fw-bold mb-3">Something went wrong.</h2>
    <p className="text-muted mb-4">
      {error.message || "We apologize for the inconvenience."}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="btn btn-primary fw-bold px-4 rounded-pill"
    >
      Try Again
    </button>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "#1e293b",
                    color: "#fff",
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
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
