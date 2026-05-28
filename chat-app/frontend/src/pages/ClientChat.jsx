import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ClientChat() {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    socket.emit("join", user.id);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    });

    socket.on("conversationClosed", () => {
      setIsClosed(true);
    });

    return () => {
      socket.off("newMessage");
      socket.off("conversationClosed");
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!contenu.trim()) return;
    setLoading(true);
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
      {!isOpen ? (
        <button 
          className="widget-toggle hover:scale-105 active:scale-95 animate-scale-in" 
          onClick={() => setIsOpen(true)}
          title="Ouvrir le support"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="35px">
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="widget-header-text">
                  <h3>Support en direct</h3>
                  <span>
                    <span className="online-dot" />
                    En ligne — réponse rapide
                  </span>
                </div>
              </div>
              <div className="widget-actions">
                <button onClick={() => setIsOpen(false)} title="Réduire" style={{ marginRight: '0.2rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <button onClick={handleLogout} title="Déconnexion">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Welcome */}
            <div className="widget-welcome">
              <div className="widget-welcome-card">
                <h4>Bienvenue, {user.nom} 👋</h4>
                <p>
                  Vous êtes connecté en tant que <strong style={{ color: "var(--accent-light)" }}>{user.role}</strong>.
                  Envoyez un message pour démarrer la conversation.
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="widget-messages">
              {messages.length === 0 ? (
                <div className="widget-empty">
                  <div className="widget-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h4>Prêt à vous aider</h4>
                  <p>Tapez votre question ci-dessous pour contacter un agent de support.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.id || msg.senderId?._id === user.id;
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {!isMe && (
                        <div
                          className="avatar avatar-sm"
                          style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", fontSize: "0.7rem" }}
                        >
                          A
                        </div>
                      )}
                      <div className={`chat-bubble ${isMe ? "sent" : "received"}`}>
                        {msg.contenu}
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
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: "1.5px" }} />
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
