const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchAPI = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("Request:", `${BASE_URL}${endpoint}`);
  console.log("Token exists:", !!token);
  console.log("Authorization:", headers["Authorization"]);

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
