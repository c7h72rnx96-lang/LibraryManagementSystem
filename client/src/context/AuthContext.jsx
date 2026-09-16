import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance.js";
import toast from "react-hot-toast";

export const AuthContext = createContext();

const authChannel = new BroadcastChannel("auth_sync_channel");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // 1. Listen for cross-tab logins/logouts
    const handleMessage = (event) => {
      if (event.data.type === "LOGIN") {
        setUser(event.data.user);
      } else if (event.data.type === "LOGOUT") {
        setUser(null);
      }
    };
    authChannel.addEventListener("message", handleMessage);

    // 2. Listen for current-tab 401 expirations from Axios
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      authChannel.removeEventListener("message", handleMessage);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      setUser(response.data.user);
      authChannel.postMessage({ type: "LOGIN", user: response.data.user });
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      setUser(null);
      authChannel.postMessage({ type: "LOGOUT" });
      toast.success("Logged out successfully!");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
