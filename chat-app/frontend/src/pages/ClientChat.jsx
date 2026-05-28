import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ClientChat() {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setIsOpen(true);
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
    <div className="screen-center">
      <div className="chat-widget card fade-in-up" style={{ overflow: "hidden", maxWidth: "420px", width: "100%" }}>
        <div className="chat-header" style={{ padding: "1.4rem 1.5rem" }}>
          <div>
            <p className="panel-title" style={{ marginBottom: "0.35rem" }}>
              Support en direct
            </p>
            <p className="panel-subtitle">
              Utilisez ce chat pour obtenir une aide immédiate, sans quitter le portail.
            </p>
          </div>
          <button className="button-secondary" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>

        <div className="chat-body">
          <div className="panel-content" style={{ paddingTop: 0, gap: "1.3rem" }}>
            <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "1.5rem" }}>
              <p className="font-bold" style={{ marginBottom: "0.65rem" }}>
                Bienvenue, {user.nom}
              </p>
              <p className="panel-subtitle">
                Vous êtes connecté en tant que <strong>{user.role}</strong>. Envoyez un message pour démarrer la conversation.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
                  <p className="font-bold" style={{ marginBottom: "0.5rem" }}>
                    Prêt à vous aider
                  </p>
                  <p className="panel-subtitle">
                    Tapez votre question dans la zone de saisie ci-dessous pour contacter un agent.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id || msg.senderId?._id === user.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={isMe ? "chat-bubble sent" : "chat-bubble received"}>
                        {msg.contenu}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        <div className="chat-footer">
          {isClosed && (
            <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
              <p className="font-semibold" style={{ marginBottom: "0.35rem" }}>
                Conversation fermée
              </p>
              <p className="panel-subtitle">Un agent a clôturé cette discussion.</p>
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrire un message..."
              disabled={isClosed}
            />
            <button
              className="button-primary"
              onClick={sendMessage}
              disabled={!contenu.trim() || isClosed || loading}
              style={{ minWidth: "4rem" }}
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
