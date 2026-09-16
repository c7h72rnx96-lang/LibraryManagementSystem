// === src/pages/Support/CustomerSupport.jsx ===
import React, { useState, useEffect, useContext, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance.js";
import { SocketContext } from "../../context/SocketContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../constants/queryKeys.js";
import {
  FaHeadset,
  FaPaperPlane,
  FaCheckCircle,
  FaStore,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaComments,
  FaTicketAlt,
  FaPlus,
  FaArrowLeft,
  FaCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const CustomerSupport = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(
    isAdmin ? "view_tickets" : "contact",
  );
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    message: "",
  });
  const [ticketReplyText, setTicketReplyText] = useState("");

  const [chatPartner, setChatPartner] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessageId, setSendingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const ticketScrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Clear session storage on unmount to stop notifications blocking
  useEffect(() => {
    return () => sessionStorage.removeItem("activeChatPartner");
  }, []);

  // ==========================================
  // 1. TANSTACK QUERY: SERVER STATE
  // ==========================================

  // TICKETS
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: queryKeys.support.tickets,
    queryFn: async () => (await axiosInstance.get("/support/tickets")).data,
  });

  const { data: ticketReplies = [], isLoading: loadingReplies } = useQuery({
    queryKey: queryKeys.support.ticketMessages(selectedTicket?.id),
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/support/${selectedTicket.id}/messages`,
      );
      setTimeout(
        () => ticketScrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
      return res.data.messages;
    },
    enabled: !!selectedTicket,
  });

  // CHATS
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["chat", chatPartner?.id],
    queryFn: async () => {
      if (!chatPartner || chatPartner === "NEW") return [];
      const res = await axiosInstance.get(`/chat/history/${chatPartner.id}`);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
      return res.data;
    },
    enabled: !!chatPartner && chatPartner !== "NEW",
  });

  const { data: contactList = [] } = useQuery({
    queryKey: ["chatPartners"],
    queryFn: async () => (await axiosInstance.get("/chat/partners")).data,
    enabled: chatPartner === "NEW",
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["chatConversations"],
    queryFn: async () => (await axiosInstance.get("/chat/conversations")).data,
    enabled: activeTab === "live_chat",
  });

  // ==========================================
  // 2. TANSTACK MUTATIONS: TICKETS
  // ==========================================
  const submitTicketMutation = useMutation({
    mutationFn: async (ticketData) =>
      axiosInstance.post("/support", ticketData),
    onSuccess: () => {
      toast.success("Support Ticket Submitted!");
      setNewTicketData({ subject: "", message: "" });
      setActiveTab("view_tickets");
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
    },
    onError: (err) => toast.error(err.message || "Failed to submit ticket."),
  });

  const replyTicketMutation = useMutation({
    mutationFn: async (text) =>
      (
        await axiosInstance.post(`/support/${selectedTicket.id}/messages`, {
          message: text,
        })
      ).data,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(
        queryKeys.support.ticketMessages(selectedTicket.id),
        (old) => [...(old || []), newMessage],
      );
      setTimeout(
        () => ticketScrollRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    },
    onError: (err) => toast.error(err.message || "Failed to post reply."),
  });

  const closeTicketMutation = useMutation({
    mutationFn: async () =>
      axiosInstance.put(`/support/${selectedTicket.id}/close`, {}),
    onSuccess: () => {
      toast.success("Ticket closed.");
      setSelectedTicket({ ...selectedTicket, status: "Closed" });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
    },
    onError: (err) => toast.error(err.message || "Failed to close ticket."),
  });

  // ==========================================
  // 3. LIVE CHAT SOCKET EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    const validMsg = chatMessages.find((m) => m.conversationId);
    if (chatPartner && validMsg && activeTab === "live_chat" && socket) {
      socket.emit("message:read", {
        conversationId: validMsg.conversationId,
      });
      queryClient.invalidateQueries({ queryKey: ["unreadChats"] });
    }
  }, [chatMessages, chatPartner, activeTab, socket, queryClient]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        chatPartner &&
        (msg.senderId === chatPartner.id || msg.receiverId === chatPartner.id)
      ) {
        queryClient.setQueryData(["chat", chatPartner.id], (old) => {
          if (old?.some((m) => m.id === msg.id)) return old;
          return [...(old || []), msg];
        });

        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );

        if (msg.conversationId) {
          socket.emit("message:read", { conversationId: msg.conversationId });
        }
        queryClient.invalidateQueries({ queryKey: ["unreadChats"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      }
    };

    const handleTyping = ({ senderId, isTyping }) => {
      if (chatPartner && senderId === chatPartner.id) setIsTyping(isTyping);
    };

    const handleTicketReply = (reply) => {
      if (selectedTicket && reply.ticketId === selectedTicket.id) {
        queryClient.setQueryData(
          queryKeys.support.ticketMessages(selectedTicket.id),
          (old) => [...(old || []), reply],
        );
        setTimeout(
          () => ticketScrollRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:status", handleTyping);
    socket.on("ticket_reply", handleTicketReply);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:status", handleTyping);
      socket.off("ticket_reply", handleTicketReply);
    };
  }, [socket, chatPartner, selectedTicket, queryClient]);

  // ==========================================
  // 4. CHAT HANDLERS
  // ==========================================
  const openLiveChat = (partner) => {
    setChatPartner(partner);
    setActiveTab("live_chat");
    sessionStorage.setItem("activeChatPartner", partner.id);
  };

  const startAdminChat = async () => {
    try {
      const res = await axiosInstance.get("/chat/admin");
      if (res.data.adminId) {
        openLiveChat({
          id: res.data.adminId,
          username: "Platform Support",
          role: "admin",
        });
      } else {
        toast.error("Support is currently offline.");
      }
    } catch (err) {
      toast.error("Failed to connect to admin.");
    }
  };

  const handleTypingChange = (e) => {
    setChatInput(e.target.value);
    if (!socket || !chatPartner || chatPartner === "NEW") return;

    socket.emit("typing:start", { receiverId: chatPartner.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId: chatPartner.id });
    }, 1500);
  };

  const sendLiveMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !chatPartner || chatPartner === "NEW")
      return;

    if (!socket.connected) {
      toast.error("Chat is currently disconnected. Reconnecting...");
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const payload = { receiverId: chatPartner.id, message: chatInput };

    queryClient.setQueryData(["chat", chatPartner.id], (old) => [
      ...(old || []),
      { id: tempId, senderId: user.id, message: chatInput, isPending: true },
    ]);
    setChatInput("");
    setSendingMessageId(tempId);

    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );

    socket.emit("message:send", payload, (response) => {
      setSendingMessageId(null);
      if (response.success) {
        queryClient.setQueryData(["chat", chatPartner.id], (old) =>
          old.map((msg) => (msg.id === tempId ? response.data : msg)),
        );
      } else {
        toast.error(response.error?.message || "Failed to send message");
        queryClient.setQueryData(["chat", chatPartner.id], (old) =>
          old.filter((msg) => msg.id !== tempId),
        );
      }
    });
  };

  return (
    <div className="container-fluid mt-2 mb-5 max-w-75">
      <style>{`
        .social-btn { transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
        .social-btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .social-btn.insta:hover { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-color: transparent; }
        .social-btn.fb:hover { background: #1877F2; border-color: transparent; }
        .social-btn.tw:hover { background: #1DA1F2; border-color: transparent; }
        .social-btn.in:hover { background: #0A66C2; border-color: transparent; }
        .chat-bg { background: rgba(0,0,0,0.3); background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px; }
      `}</style>

      <h2 className="mb-4 text-white d-flex align-items-center">
        <FaHeadset className="me-3 text-info" /> Support & Communications
      </h2>

      <div className="row g-4 h-100">
        <div className="col-lg-3">
          <div
            className="card shadow-lg border-0 rounded-4 h-100 p-3 d-flex flex-column gap-2"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: "75vh",
            }}
          >
            {!isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`btn text-start fw-bold p-3 rounded-3 transition-all ${activeTab === "contact" ? "bg-warning text-dark shadow" : "btn-dark text-muted"}`}
                >
                  <FaPhoneAlt className="me-2" /> Contact Us
                </button>
                <hr className="border-secondary opacity-25 my-1" />
              </>
            )}

            <button
              onClick={() => setActiveTab("live_chat")}
              className={`btn text-start fw-bold p-3 rounded-3 transition-all ${activeTab === "live_chat" ? "bg-primary text-white shadow" : "btn-dark text-muted"}`}
            >
              <FaComments className="me-2" /> Live Chat
            </button>
            <button
              onClick={() => {
                setActiveTab("view_tickets");
                setSelectedTicket(null);
              }}
              className={`btn text-start fw-bold p-3 rounded-3 transition-all ${activeTab === "view_tickets" ? "bg-info text-dark shadow" : "btn-dark text-muted"}`}
            >
              <FaTicketAlt className="me-2" /> Support Tickets
            </button>

            {!isAdmin && (
              <button
                onClick={() => {
                  setActiveTab("create_ticket");
                  setSelectedTicket(null);
                }}
                className={`btn text-start fw-bold p-3 rounded-3 transition-all ${activeTab === "create_ticket" ? "bg-success text-white shadow" : "btn-dark text-muted"}`}
              >
                <FaPlus className="me-2" /> Open Ticket
              </button>
            )}
          </div>
        </div>

        <div className="col-lg-9">
          <div
            className="card shadow-lg border-0 rounded-4 h-100 d-flex flex-column overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: "75vh",
            }}
          >
            {activeTab === "contact" && !isAdmin && (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 p-5 text-center position-relative">
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 bg-warning opacity-10"
                  style={{ filter: "blur(100px)", zIndex: 0 }}
                ></div>

                <div className="position-relative z-1">
                  <FaHeadset
                    size={70}
                    className="mb-4 text-warning opacity-75"
                  />
                  <h2 className="fw-bold text-white mb-2">Get in Touch</h2>
                  <p
                    className="text-muted mb-4 fs-5 mx-auto"
                    style={{ maxWidth: "450px" }}
                  >
                    Need immediate platform support? Reach out to LibraryMS
                    Administration via any channel below.
                  </p>

                  <div className="d-flex gap-3 mb-5 justify-content-center">
                    <button
                      onClick={startAdminChat}
                      className="btn btn-warning btn-lg fw-bold rounded-pill px-4 shadow-sm text-dark d-flex align-items-center"
                    >
                      <FaComments className="me-2" /> Chat With Us
                    </button>
                    <a
                      href="mailto:admin@libraryms.com?subject=Platform Inquiry"
                      className="btn btn-outline-light btn-lg fw-bold rounded-pill px-4 d-flex align-items-center"
                    >
                      <FaEnvelope className="me-2" /> Email Us
                    </a>
                  </div>

                  <div
                    className="border-top border-secondary border-opacity-50 pt-4 mx-auto w-100"
                    style={{ maxWidth: "400px" }}
                  >
                    <h6 className="text-muted text-uppercase fw-bold mb-4 small tracking-wide">
                      Official Support Lines
                    </h6>
                    <div className="d-flex justify-content-center mb-4">
                      <a
                        href="tel:+9779800000000"
                        className="text-decoration-none text-white fs-4 fw-bold d-flex align-items-center p-3 rounded-4 transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="bg-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                          <FaPhoneAlt size={18} />
                        </div>
                        +977 980-000-0000
                      </a>
                    </div>

                    <div className="d-flex justify-content-center gap-4">
                      <a
                        href="#"
                        className="btn btn-dark rounded-circle social-btn insta d-flex justify-content-center align-items-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaInstagram size={24} className="text-light" />
                      </a>
                      <a
                        href="#"
                        className="btn btn-dark rounded-circle social-btn fb d-flex justify-content-center align-items-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaFacebook size={24} className="text-light" />
                      </a>
                      <a
                        href="#"
                        className="btn btn-dark rounded-circle social-btn tw d-flex justify-content-center align-items-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaTwitter size={24} className="text-light" />
                      </a>
                      <a
                        href="#"
                        className="btn btn-dark rounded-circle social-btn in d-flex justify-content-center align-items-center"
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaLinkedin size={24} className="text-light" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "create_ticket" && !isAdmin && (
              <div className="p-4 p-md-5">
                <h4 className="text-white fw-bold mb-4 d-flex align-items-center">
                  <FaTicketAlt className="me-2 text-success" /> Submit a Formal
                  Support Ticket
                </h4>
                <p className="text-muted mb-4">
                  Formal tickets are routed strictly to the Platform
                  Administration team for resolution.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitTicketMutation.mutate(newTicketData);
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g., Account Verification Issue"
                      value={newTicketData.subject}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          subject: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold text-uppercase">
                      Routing
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-muted border-secondary fw-bold"
                      value="Platform Administration"
                      disabled
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold text-uppercase">
                      Detailed Description
                    </label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="5"
                      placeholder="Explain your issue here..."
                      value={newTicketData.message}
                      onChange={(e) =>
                        setNewTicketData({
                          ...newTicketData,
                          message: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submitTicketMutation.isPending}
                    className="btn btn-success fw-bold px-5 py-2 rounded-pill d-flex align-items-center shadow-sm"
                  >
                    <FaCheckCircle className="me-2" />{" "}
                    {submitTicketMutation.isPending
                      ? "Submitting..."
                      : "Submit Ticket"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "view_tickets" && (
              <div className="d-flex flex-column h-100">
                {!selectedTicket ? (
                  <div className="p-4 flex-grow-1 overflow-auto">
                    <h5 className="text-white fw-bold mb-4">Support Tickets</h5>
                    {loadingTickets ? (
                      <div className="text-center p-4">
                        <div className="spinner-border text-info"></div>
                      </div>
                    ) : (
                      <div className="list-group">
                        {tickets.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className="list-group-item list-group-item-action bg-dark text-white border-secondary mb-2 rounded-3 p-3 text-start"
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="fw-bold m-0 text-info">
                                Ticket #{t.id}: {t.subject}
                              </h6>
                              <span
                                className={`badge ${t.status === "Open" ? "bg-success" : "bg-secondary"}`}
                              >
                                {t.status}
                              </span>
                            </div>
                            <small className="text-muted">
                              {isAdmin
                                ? `From: ${t.Customer?.username} • `
                                : ""}
                              Created:{" "}
                              {new Date(t.createdAt).toLocaleDateString()}
                            </small>
                          </button>
                        ))}
                        {tickets.length === 0 && (
                          <div className="text-muted text-center p-5">
                            No tickets found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="d-flex flex-column h-100">
                    <div className="p-3 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="btn btn-light fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center"
                        >
                          <FaArrowLeft className="me-2" /> Back
                        </button>
                        <h5 className="m-0 text-white fw-bold">
                          Ticket #{selectedTicket.id}
                        </h5>
                      </div>
                      {selectedTicket.status === "Open" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Close this ticket?"))
                              closeTicketMutation.mutate();
                          }}
                          className="btn btn-outline-success rounded-pill fw-bold"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>

                    <div className="p-4 flex-grow-1 overflow-auto bg-transparent">
                      {loadingReplies ? (
                        <div className="text-center p-4">
                          <div className="spinner-border text-info"></div>
                        </div>
                      ) : (
                        ticketReplies.map((reply, i) => (
                          <div
                            key={i}
                            className="mb-4 bg-dark p-3 rounded-4 border border-secondary shadow-sm"
                          >
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge bg-secondary text-uppercase">
                                {reply.Sender?.role}
                              </span>
                              <strong className="text-info">
                                {reply.Sender?.username}
                              </strong>
                              <small className="text-muted ms-auto">
                                {new Date(reply.createdAt).toLocaleString()}
                              </small>
                            </div>
                            <p
                              className="text-white m-0"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {reply.message}
                            </p>
                          </div>
                        ))
                      )}
                      <div ref={ticketScrollRef} />
                    </div>

                    {selectedTicket.status === "Open" && (
                      <div className="p-3 bg-dark border-top border-secondary">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (ticketReplyText.trim()) {
                              replyTicketMutation.mutate(ticketReplyText);
                              setTicketReplyText("");
                            }
                          }}
                          className="d-flex gap-2"
                        >
                          <input
                            type="text"
                            className="form-control bg-transparent text-white border-secondary"
                            placeholder="Add a reply to this ticket..."
                            value={ticketReplyText}
                            onChange={(e) => setTicketReplyText(e.target.value)}
                          />
                          <button
                            type="submit"
                            disabled={
                              !ticketReplyText.trim() ||
                              replyTicketMutation.isPending
                            }
                            className="btn btn-primary fw-bold px-4"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: LIVE CHAT */}
            {activeTab === "live_chat" && (
              <div className="row g-0 h-100">
                <div className="col-4 border-end border-secondary border-opacity-50 h-100 overflow-auto bg-dark d-flex flex-column">
                  <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center position-sticky top-0 bg-dark z-1">
                    <h6 className="text-white fw-bold m-0">Recent Chats</h6>
                    <button
                      onClick={() => setChatPartner("NEW")}
                      className="btn btn-sm btn-info rounded-circle shadow-sm"
                      title="Start New Chat"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="list-group list-group-flush rounded-0 flex-grow-1">
                    {conversations.map((conv) => {
                      const partner =
                        conv.participant1Id === user.id
                          ? conv.Participant2
                          : conv.Participant1;
                      if (!partner) return null;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => openLiveChat(partner)}
                          className={`text-start list-group-item list-group-item-action p-3 border-bottom border-secondary border-opacity-25 ${chatPartner?.id === partner.id ? "bg-primary bg-opacity-25" : "bg-transparent text-white"}`}
                        >
                          <div className="fw-bold text-truncate">
                            {partner.storeName || partner.username}
                          </div>
                          <small className="text-muted text-uppercase">
                            {partner.role}
                          </small>
                        </button>
                      );
                    })}
                    {conversations.length === 0 && (
                      <div className="text-muted p-3 text-center small mt-3">
                        No active chats. Click + to start.
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-8 d-flex flex-column h-100">
                  {chatPartner === "NEW" ? (
                    <div className="p-4 flex-grow-1 overflow-auto">
                      <h4 className="text-white fw-bold mb-4">
                        Start a Conversation
                      </h4>
                      <p className="text-muted small">
                        Choose a contact to begin a real-time chat.
                      </p>
                      <div className="list-group">
                        {contactList.map((p) => (
                          <div
                            key={p.id}
                            className="list-group-item bg-dark border-secondary d-flex justify-content-between align-items-center p-3 mb-2 rounded-3"
                          >
                            <div className="text-white">
                              <strong className="d-block">
                                {p.storeName || p.username}
                              </strong>
                              <span className="badge bg-secondary mt-1 text-uppercase">
                                {p.role}
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              <a
                                href={`mailto:${p.email}`}
                                className="btn btn-sm btn-outline-light d-flex align-items-center"
                              >
                                <FaEnvelope className="me-1" /> Email
                              </a>
                              <button
                                onClick={() => openLiveChat(p)}
                                className="btn btn-sm btn-primary fw-bold d-flex align-items-center"
                              >
                                <FaComments className="me-1" /> Chat
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : chatPartner ? (
                    <>
                      <div className="p-3 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center">
                        <h6 className="text-white fw-bold m-0 d-flex align-items-center">
                          <FaCircle
                            className={`me-2 ${onlineUsers && onlineUsers.includes(chatPartner.id) ? "text-success" : "text-secondary"}`}
                            size={12}
                            title={
                              onlineUsers &&
                              onlineUsers.includes(chatPartner.id)
                                ? "Online"
                                : "Offline"
                            }
                          />
                          {chatPartner.storeName || chatPartner.username}
                        </h6>
                        <a
                          href={`mailto:${chatPartner.email}`}
                          className="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold"
                        >
                          <FaEnvelope className="me-2" /> Email
                        </a>
                      </div>

                      <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-3 chat-bg">
                        {chatMessages.map((msg, idx) => {
                          const isMe = msg.senderId === user.id;
                          return (
                            <div
                              key={idx}
                              className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}
                            >
                              <div
                                className={`p-3 rounded-4 shadow-sm ${isMe ? "bg-primary text-white" : "bg-dark text-white border border-secondary"}`}
                                style={{
                                  maxWidth: "80%",
                                  opacity: msg.isPending ? 0.6 : 1,
                                  borderBottomRightRadius: isMe
                                    ? "4px"
                                    : "16px",
                                  borderBottomLeftRadius: !isMe
                                    ? "4px"
                                    : "16px",
                                }}
                              >
                                <p
                                  className="m-0"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.message}
                                </p>
                              </div>
                              {msg.isPending && (
                                <small
                                  className="text-muted mt-1 me-2"
                                  style={{ fontSize: "10px" }}
                                >
                                  Sending...
                                </small>
                              )}
                            </div>
                          );
                        })}
                        {isTyping && (
                          <div className="text-muted small ms-2 fst-italic">
                            {chatPartner.username} is typing...
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-3 bg-dark border-top border-secondary">
                        <form
                          onSubmit={sendLiveMessage}
                          className="d-flex gap-2"
                        >
                          <input
                            type="text"
                            className="form-control bg-transparent text-white border-secondary rounded-pill px-4"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={handleTypingChange}
                            disabled={sendingMessageId !== null}
                          />
                          <button
                            type="submit"
                            className="btn btn-primary rounded-circle shadow"
                            style={{ width: "45px", height: "45px" }}
                            disabled={
                              !chatInput.trim() || sendingMessageId !== null
                            }
                          >
                            <FaPaperPlane />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted opacity-50 p-5 text-center">
                      <FaComments size={60} className="mb-3" />
                      <h5>Select a conversation</h5>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
