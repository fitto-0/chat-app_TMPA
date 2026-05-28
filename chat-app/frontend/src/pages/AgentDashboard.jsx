import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  pending: "status-away text-yellow-700 bg-yellow-50",
  active: "status-online text-green-700 bg-green-50",
  closed: "status-offline text-slate-500 bg-slate-100",
};

const priorityStyles = {
  low: "priority-low",
  normal: "priority-normal",
  high: "priority-high",
};

function Avatar({ name = "?", size = "md" }) {
  const colors = ["#2563eb", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  const sizes = {
    sm: "2.3rem",
    md: "3rem",
    lg: "3.5rem",
  };
  return (
    <div
      className="avatar"
      style={{
        backgroundColor: color,
        width: sizes[size],
        height: sizes[size],
        fontSize: size === "sm" ? "0.9rem" : "1rem",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AgentDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
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
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv._id === data.conversationId
            ? { ...conv, lastMessage: data.message.contenu, updatedAt: new Date().toISOString() }
            : conv,
        );
        return updated;
      });
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
  const displayedConvs = activeTab === "conversations" ? activeConvs : closedConvs;

  return (
    <div className="dashboard">
      <section className="sidebar fade-in-up">
        <div className="sidebar-logo">
          <div className="avatar" style={{ backgroundColor: "#2563eb" }}>
            C
          </div>
          <div>
            <p className="font-bold" style={{ color: "#0f172a" }}>
              ChatSupport
            </p>
            <p className="panel-subtitle">Tableau agent</p>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "conversations" ? "active" : ""}`}
            onClick={() => setActiveTab("conversations")}
          >
            Conversations actives
          </button>
          <button
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Historique
          </button>
        </div>

        <div className="sidebar-user">
          <Avatar name={user.nom} size="sm" />
          <div style={{ minWidth: 0 }}>
            <p className="font-bold" style={{ color: "#0f172a", marginBottom: "0.15rem" }}>
              {user.nom}
            </p>
            <p className="panel-subtitle">Agent connecté</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </section>

      <section className="sidebar-panel fade-in-up">
        <div className="panel-header" style={{ padding: "1.5rem 1.5rem 0.8rem" }}>
          <div>
            <h2 className="panel-title">{activeTab === "conversations" ? "Conversations" : "Historique"}</h2>
            <p className="panel-subtitle">{displayedConvs.length} discussion(s) trouvée(s)</p>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 1rem 1rem" }}>
          {displayedConvs.length === 0 ? (
            <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p className="font-bold" style={{ marginBottom: "0.5rem" }}>Aucune discussion</p>
              <p className="panel-subtitle">Attendez qu'un client démarre une conversation.</p>
            </div>
          ) : (
            displayedConvs.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-card ${selected?._id === conv._id ? "selected" : ""}`}
                onClick={() => openConversation(conv)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ marginBottom: "0.35rem" }}>
                      {conv.clientId?.nom || "Client"}
                    </p>
                    <p className="panel-subtitle" style={{ fontSize: "0.85rem" }}>
                      {conv.clientId?.email}
                    </p>
                  </div>
                  <span className={`priority-pill ${priorityStyles[conv.priority || "normal"]}`}>
                    {conv.priority || "normal"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2" style={{ marginTop: "0.75rem" }}>
                  <p className="panel-subtitle" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.lastMessage || "Message initial..."}
                  </p>
                  <span className={`status-dot ${statusStyles[conv.status]}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="chat-panel fade-in-up">
        {selected ? (
          <>
            <div className="chat-header">
              <div className="flex items-center gap-3">
                <Avatar name={selected.clientId?.nom || "C"} size="md" />
                <div>
                  <p className="font-bold" style={{ fontSize: "1.1rem" }}>
                    {selected.clientId?.nom || "Client"}
                  </p>
                  <p className="panel-subtitle">{selected.subject || "Support client"}</p>
                </div>
              </div>
              <button className="button-secondary" onClick={closeConversation}>
                Fermer la conversation
              </button>
            </div>

            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="glass-card" style={{ padding: "1.75rem", textAlign: "center" }}>
                  <p className="font-bold" style={{ marginBottom: "0.35rem" }}>
                    Conversation ouverte
                  </p>
                  <p className="panel-subtitle">Rédigez une réponse pour démarrer la discussion.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAgent = msg.senderId?._id === user.id || msg.senderId === user.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-3 ${isAgent ? "justify-end" : "justify-start"}`}
                    >
                      {!isAgent && <Avatar name={selected.clientId?.nom || "C"} size="sm" />}
                      <div className={`chat-bubble ${isAgent ? "sent" : "received"}`}>
                        {msg.contenu}
                      </div>
                      {isAgent && <Avatar name={user.nom} size="sm" />}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-footer">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Répondre au client..."
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && replyMessage()}
                />
                <button className="button-primary" onClick={replyMessage} disabled={!contenu.trim()}>
                  Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="panel-content" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
              <p className="font-bold" style={{ marginBottom: "0.5rem" }}>
                Sélectionnez une conversation
              </p>
              <p className="panel-subtitle">
                Les messages du client apparaîtront ici une fois la session ouverte.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
