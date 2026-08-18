import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../utils/api.js";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login when the current TAB is refreshed
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid stored user:", error);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // IMPORTANT:
      // sessionStorage = current browser TAB only
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
