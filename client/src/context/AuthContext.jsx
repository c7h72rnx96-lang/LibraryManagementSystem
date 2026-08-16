import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../utils/api.js";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Always start loading until we check local storage

  useEffect(() => {
    // 1. Check if user is already logged in when they refresh the page
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    // Stop loading once we finish checking
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 2. Send login request to the backend
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // 3. Save the token and user details in the browser
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. Update the global state
      setUser(data.user);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      // Show an error popup if backend rejects the login
      toast.error(error.message);
      return false;
    }
  };

  const logout = () => {
    // 5. Delete saved data and reset state
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
