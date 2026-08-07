const BASE_URL = "http://localhost:3000/api";

export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = { ...options.headers };

  if (!options.body || typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("➡️ Request:", `${BASE_URL}${endpoint}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log("⬅️ Status:", response.status);

  const data = await response.json();

  console.log("📦 Response:", data);

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
};
