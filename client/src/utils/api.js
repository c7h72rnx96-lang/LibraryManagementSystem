const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAPI = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  // Only add JSON content type when we are not sending FormData
  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  // Add authentication token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("Request:", `${BASE_URL}${endpoint}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log("Status:", response.status);

  const data = await response.json();

  console.log("Response:", data);

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
};
