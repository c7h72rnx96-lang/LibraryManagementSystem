import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    // 🔥 NEW: Unwrap the standardized backend response globally so React components don't break
    if (
      response.data &&
      response.data.success === true &&
      response.data.data !== undefined
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(new Error("Network Error"));
    }

    if (error.response.status === 401) {
      const isAuthCheck = error.config.url.includes("/auth/me");
      const isLoginRequest = error.config.url.includes("/auth/login");

      if (!isAuthCheck && !isLoginRequest) {
        if (!window.hasShown401) {
          toast.error("Please log in to continue.");
          window.hasShown401 = true;
          setTimeout(() => {
            window.hasShown401 = false;
          }, 3000);
        }

        // 🔥 Inform React to clear the user context instead of a hard reload
        window.dispatchEvent(new CustomEvent("session-expired"));
      }
    }

    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "An unexpected error occurred";
    error.message = backendMessage;

    return Promise.reject(error);
  },
);

export default axiosInstance;
