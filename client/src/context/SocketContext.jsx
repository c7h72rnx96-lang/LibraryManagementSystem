import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export const SocketContext = createContext();

// Bulletproof URL parsing to ensure it finds your backend
let SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
SOCKET_URL = SOCKET_URL.replace(/\/api\/?$/, "");
if (!SOCKET_URL || SOCKET_URL === "") SOCKET_URL = "http://localhost:3000";

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log("🔌 Attempting to connect socket to:", SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      // 🔥 REMOVED transports: ["websocket"] so it safely falls back to polling!
    });

    newSocket.on("connect", () => {
      console.log("🟢 Live Socket Connected! ID:", newSocket.id);
      queryClient.invalidateQueries({ queryKey: ["chat"] });
      queryClient.invalidateQueries({ queryKey: ["unreadChats"] });
    });

    newSocket.on("connect_error", (err) => {
      console.error("🔴 Socket Connection Error:", err.message);
    });

    newSocket.on("presence:update", (usersArray) => {
      setOnlineUsers(usersArray);
    });

    newSocket.on("notification:new", (notification) => {
      const activeChat = sessionStorage.getItem("activeChatPartner");
      if (activeChat !== String(notification.senderId)) {
        toast.success(`${notification.title}\n${notification.message}`, {
          icon: "💬",
        });
        queryClient.invalidateQueries({ queryKey: ["unreadChats"] });
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
