import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SeenStatus from "../components/SeenStatus";
import logo from "../assets/logo.png";

export default function ClientChat() {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const isOwnMessage = useCallback(
    (msg) =>
      user &&
      (msg.senderId === user.id || msg.senderId?._id === user.id),
    [user],
  );

  const markAsRead = useCallback(async (convId) => {
    if (!convId) return;
    try {
      await axios.put(`/messages/conversations/${convId}/read`);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadConversation = async () => {
      try {
        const res = await axios.get("/messages/conversations");
        const active = res.data.find((c) => c.status !== "closed");
        if (active) {
          const msgRes = await axios.get(
            `/messages/conversations/${active._id}`,
          );
          setConversationId(active._id);
          setMessages(msgRes.data.messages || []);
          setIsClosed(active.status === "closed");
          socket.emit("joinConversation", active._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadConversation();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user.id);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    });

    socket.on("messagesSeen", (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            isOwnMessage(msg) &&
            data.messageIds?.some(
              (id) => id.toString() === (msg._id?.toString?.() ?? msg._id),
            )
          ) {
            return { ...msg, isRead: true, readAt: data.readAt };
          }
          return msg;
        }),
      );
    });

    socket.on("conversationClosed", () => {
      setIsClosed(true);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("conversationClosed");
    };
  }, [user, isOwnMessage]);

  useEffect(() => {
    if (!conversationId || !isOpen || !user) return;

    const hasUnreadFromOther = messages.some(
      (msg) => !isOwnMessage(msg) && !msg.isRead,
    );

    if (hasUnreadFromOther) {
      markAsRead(conversationId);
    }
  }, [conversationId, isOpen, messages, user, isOwnMessage, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!contenu.trim()) return;
    setLoading(true);
    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post("/messages/send", {
        contenu,
      });
      setConversationId(res.data.conversation._id);
      setMessages((prev) => [...prev, res.data.message]);
      socket.emit("joinConversation", res.data.conversation._id);
      setIsClosed(false);
      setContenu("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="widget-page">
      <div className="hero-section">
        <img
          src={logo}
          alt="Tanger Med"
          className="hero-logo"
        />

        <h1>Bienvenue sur le Support Tanger Med</h1>

        <p>
          Notre équipe est disponible pour répondre à vos questions et vous
          accompagner dans vos démarches.
        </p>

        <a
          href="https://www.tangermedport.com/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-btn"
        >
          Visiter le site officiel
        </a>
      </div>
      {!isOpen ? (
        <button
          className="widget-toggle hover:scale-105 active:scale-95 animate-scale-in"
          onClick={() => setIsOpen(true)}
          title="Ouvrir le support"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="35px"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      ) : (
        <div className="widget-container animate-scale-in">
          <div className="widget-box">
            {/* Header */}
            <div className="widget-header">
              <div className="widget-header-info">
                <div className="widget-header-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="widget-header-text">
                  <h3>Support en direct</h3>
                  <span>
                    <span className="online-dot" />
                    En ligne - réponse rapide
                  </span>
                </div>
              </div>
              <div className="widget-actions">
                <button
                  onClick={() => setIsOpen(false)}
                  title="Réduire"
                  style={{ marginRight: "0.2rem" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {user ? (
                  <button onClick={handleLogout} title="Déconnexion">
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
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    title="Se connecter"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            </div>

            {/* Welcome */}
            <div className="widget-welcome">
              <div className="widget-welcome-card">
                {user ? (
                  <>
                    <h4>Bienvenue, {user.nom} 👋</h4>
                    <p>
                      Vous êtes connecté en tant que{" "}
                      <strong style={{ color: "var(--accent-light)" }}>
                        {user.role}
                      </strong>
                      . Envoyez un message pour démarrer la conversation.
                    </p>
                  </>
                ) : (
                  <>
                    <h4>Bienvenue</h4>
                    <p>
                      Vous n'êtes pas connecté. Cliquez sur "Se connecter" en
                      haut pour accéder au support.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="widget-messages">
              {messages.length === 0 ? (
                <div className="widget-empty">
                  <h4>Prêt à vous aider</h4>
                  <p>
                    Tapez votre question ci-dessous pour contacter un agent de
                    support.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = isOwnMessage(msg);
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {!isMe && (
                        <div
                          className="avatar avatar-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #14b8a6, #0d9488)",
                            fontSize: "0.7rem",
                          }}
                        >
                          A
                        </div>
                      )}
                      <div
                        className={`chat-bubble-wrap ${isMe ? "" : "received-wrap"}`}
                      >
                        <div
                          className={`chat-bubble ${isMe ? "sent" : "received"}`}
                        >
                          {msg.contenu}
                        </div>
                        {isMe && (
                          <div className="chat-bubble-meta">
                            <SeenStatus isRead={msg.isRead} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Closed banner */}
            {isClosed && (
              <div className="widget-closed-banner">
                <p>Conversation fermée</p>
                <p>Un agent a clôturé cette discussion.</p>
              </div>
            )}

            {/* Input */}
            <div className="widget-input-area">
              <div className="widget-input-box">
                <input
                  type="text"
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écrire un message..."
                  disabled={isClosed}
                />
                <button
                  className="widget-send"
                  onClick={sendMessage}
                  disabled={!contenu.trim() || isClosed || loading}
                >
                  {loading ? (
                    <span
                      className="spinner"
                      style={{ width: 14, height: 14, borderWidth: "1.5px" }}
                    />
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
