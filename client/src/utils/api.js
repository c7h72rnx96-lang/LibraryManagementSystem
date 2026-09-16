const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers,
  };

  if (typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // CRITICAL: Sends HttpOnly cookies with native fetch
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) window.location.href = "/login";
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
};
