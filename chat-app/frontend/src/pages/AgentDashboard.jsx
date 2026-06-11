import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

function Avatar({ name = "?", size = "md" }) {
  const color = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const cls = `avatar avatar-${size}`;
  return (
    <div
      className={cls}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [mobilePanel, setMobilePanel] = useState("list"); // "list" | "chat"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/messages/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    socket.emit("join", user.id);
    fetchConversations();

    socket.on("newConversation", (data) => {
      setConversations((prev) => [data.conversation, ...prev]);
    });

    socket.on("newMessage", (data) => {
      if (selected && data.conversationId === selected._id) {
        setMessages((prev) => [...prev, data.message]);
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.message.contenu,
                updatedAt: new Date().toISOString(),
              }
            : conv,
        ),
      );
    });

    return () => {
      socket.off("newConversation");
      socket.off("newMessage");
    };
  }, [selected, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (conv) => {
    setSelected(conv);
    setMobilePanel("chat");
    try {
      const res = await axios.get(`/messages/conversations/${conv._id}`);
      setMessages(res.data.messages || []);
      socket.emit("joinConversation", conv._id);
    } catch (err) {
      console.error(err);
    }
  };

  const replyMessage = async () => {
    if (!contenu.trim() || !selected) return;
    try {
      const res = await axios.post(
        `/messages/conversations/${selected._id}/reply`,
        { contenu },
      );
      setMessages((prev) => [...prev, res.data]);
      setContenu("");
    } catch (err) {
      console.error(err);
    }
  };

  const closeConversation = async () => {
    if (!selected) return;
    try {
      await axios.put(`/messages/conversations/${selected._id}/close`);
      setSelected(null);
      setMobilePanel("list");
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeConvs = conversations.filter((c) => c.status !== "closed");
  const closedConvs = conversations.filter((c) => c.status === "closed");
  const displayedConvs =
    activeTab === "conversations" ? activeConvs : closedConvs;

  return (
    <div className="dashboard">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img
              src={logo}
              alt="TMPA Logo"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          <div className="sidebar-logo-text">
            <p>Tableau agent</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "conversations" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("conversations");
              setMobilePanel("list");
              setSidebarOpen(false);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Conversations
            {activeConvs.length > 0 && (
              <span className="nav-badge">{activeConvs.length}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("history");
              setMobilePanel("list");
              setSidebarOpen(false);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Historique
          </button>
        </nav>

        <div className="sidebar-user">
          <Avatar name={user.nom} size="sm" />
          <div className="sidebar-user-info">
            <p>{user.nom}</p>
            <span>
              <span
                className="status-dot status-online"
                style={{ width: 6, height: 6 }}
              />
              En ligne
            </span>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Conversation List */}
      <section
        className={`conv-panel ${mobilePanel === "chat" ? "mobile-hidden" : ""}`}
      >
        <div className="conv-panel-header">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn btn-ghost"
              onClick={() => setSidebarOpen(true)}
              style={{ marginRight: "0.25rem" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h2>
                {activeTab === "conversations" ? "Conversations" : "Historique"}
                <span className="conv-count">{displayedConvs.length}</span>
              </h2>
              <p>
                {activeTab === "conversations"
                  ? "Discussions actives"
                  : "Discussions terminées"}
              </p>
            </div>
          </div>
        </div>

        <div className="conv-items">
          {displayedConvs.length === 0 ? (
            <div className="conv-empty">
              <p style={{ fontWeight: 600 }}>Aucune discussion</p>
              <p style={{ fontSize: "0.8rem" }}>
                Attendez qu'un client démarre une conversation.
              </p>
            </div>
          ) : (
            displayedConvs.map((conv, idx) => (
              <div
                key={conv._id}
                className={`conv-item ${selected?._id === conv._id ? "selected" : ""}`}
                onClick={() => openConversation(conv)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <Avatar name={conv.clientId?.nom || "C"} size="md" />
                <div className="conv-item-info">
                  <div className="conv-item-top">
                    <p>{conv.clientId?.nom || "Client"}</p>
                    <span>{formatTime(conv.updatedAt)}</span>
                  </div>
                  <div className="conv-item-bottom">
                    <p>{conv.lastMessage || "Message initial..."}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`priority-pill priority-${conv.priority || "normal"}`}
                      >
                        {conv.priority || "normal"}
                      </span>
                      <span
                        className="status-dot"
                        style={{
                          background:
                            conv.status === "active"
                              ? "var(--success)"
                              : conv.status === "pending"
                                ? "var(--warning)"
                                : "var(--text-dim)",
                          boxShadow:
                            conv.status === "active"
                              ? "0 0 6px var(--success-glow)"
                              : conv.status === "pending"
                                ? "0 0 6px var(--warning-glow)"
                                : "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Chat Area */}
      <section
        className={`chat-area ${mobilePanel === "list" ? "mobile-hidden" : ""}`}
      >
        {selected ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <button
                  className="btn-ghost mobile-menu-btn"
                  onClick={() => {
                    setSelected(null);
                    setMobilePanel("list");
                  }}
                  style={{ marginRight: "0.25rem" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <Avatar name={selected.clientId?.nom || "C"} size="lg" />
                <div>
                  <h3>{selected.clientId?.nom || "Client"}</h3>
                  <p>
                    <span
                      className="status-dot status-online"
                      style={{ width: 6, height: 6 }}
                    />
                    {selected.subject || "Support client"}
                  </p>
                </div>
              </div>
              <button className="btn btn-danger" onClick={closeConversation}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Fermer
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div
                  className="chat-placeholder"
                  style={{ paddingTop: "3rem" }}
                >
                  <h3>Conversation ouverte</h3>
                  <p>Rédigez une réponse pour démarrer la discussion.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAgent =
                    msg.senderId?._id === user.id || msg.senderId === user.id;
                  return (
                    <div
                      key={msg._id || idx}
                      //key={msg._id}
                      className={`message-row ${isAgent ? "sent" : "received"}`}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      {!isAgent && (
                        <Avatar
                          name={selected.clientId?.nom || "C"}
                          size="sm"
                        />
                      )}
                      <div
                        className={`message-bubble ${isAgent ? "sent" : "received"}`}
                      >
                        <div
                          className={`bubble-text ${isAgent ? "sent" : "received"}`}
                        >
                          {msg.contenu}
                        </div>
                        <span className="bubble-time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      {isAgent && <Avatar name={user.nom} size="sm" />}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-area">
              <div className="chat-input-box">
                <input
                  type="text"
                  placeholder="Répondre au client..."
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && replyMessage()}
                />
                <button
                  className="send-btn"
                  onClick={replyMessage}
                  disabled={!contenu.trim()}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Sélectionnez une conversation</h3>
            <p>
              Les messages du client apparaîtront ici une fois la session
              ouverte.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
