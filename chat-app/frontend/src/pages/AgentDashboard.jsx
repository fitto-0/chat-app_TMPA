import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const statusColors = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    label: "En attente",
  },
  active: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-400",
    label: "En Ligne",
  },
  closed: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
    label: "Fermé",
  },
};

function Avatar({ name = "?", size = "md" }) {
  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
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

  useEffect(() => {
    socket.emit("join", user.id);
    fetchConversations();

    socket.on("newConversation", (data) => {
      setConversations((prev) => [data.conversation, ...prev]);
    });

    socket.on("newMessage", (data) => {
      setMessages((prev) => {
        if (selected && data.conversationId === selected._id) {
          return [...prev, data.message];
        }
        return prev;
      });
    });

    return () => {
      socket.off("newConversation");
      socket.off("newMessage");
    };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/messages/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = async (conv) => {
    setSelected(conv);
    try {
      const res = await axios.get(`/messages/conversations/${conv._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const replyMessage = async () => {
    if (!contenu.trim()) return;
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
  const displayedConvs =
    activeTab === "conversations" ? activeConvs : closedConvs;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-lg">
              ChatSupport
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              id: "conversations",
              label: "Conversations Active",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              ),
            },
            {
              id: "history",
              label: "Historique",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
            {
              id: "settings",
              label: "Paramètres",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              ),
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
              {item.label}
              {item.id === "conversations" && activeConvs.length > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeConvs.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar name={user.nom} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {user.nom}
              </p>
              <p className="text-xs text-green-500 font-medium">● En ligne</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">
              {activeTab === "conversations"
                ? "Conversations Active"
                : "Historique"}
            </h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {displayedConvs.length}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {displayedConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <svg
                className="w-12 h-12 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            displayedConvs.map((conv) => {
              const s = statusColors[conv.status] || statusColors.pending;
              return (
                <div
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all ${
                    selected?._id === conv._id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={conv.clientId?.nom || "?"} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {conv.clientId?.nom || "Client"}
                        </p>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                          {new Date(conv.updatedAt).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 truncate">
                          {conv.clientId?.email}
                        </p>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${s.text} flex-shrink-0 ml-2`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                          ></span>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar name={selected.clientId?.nom || "?"} size="md" />
                <div>
                  <h3 className="font-bold text-slate-800">
                    {selected.clientId?.nom}
                  </h3>
                  <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Connecté
                  </p>
                </div>
              </div>
              {selected.status !== "closed" && (
                <button
                  onClick={closeConversation}
                  className="flex items-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Fermer
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isAgent =
                  msg.senderId?._id === user.id || msg.senderId === user.id;
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 ${isAgent ? "justify-end" : "justify-start"}`}
                  >
                    {!isAgent && (
                      <Avatar name={selected.clientId?.nom || "?"} size="sm" />
                    )}
                    <div
                      className={`max-w-sm ${isAgent ? "items-end" : "items-start"} flex flex-col gap-1`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isAgent
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-white text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.contenu}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {isAgent && <Avatar name={user.nom} size="sm" />}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {selected.status !== "closed" ? (
              <div className="bg-white border-t border-slate-100 p-4">
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 focus-within:border-blue-300 focus-within:bg-white transition-all">
                  <button className="text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && replyMessage()}
                    placeholder="Répondre au client..."
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                  />
                  <button
                    onClick={replyMessage}
                    disabled={!contenu.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl px-4 py-1.5 text-sm font-medium flex items-center gap-2 transition-all flex-shrink-0"
                  >
                    Envoyer
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border-t border-slate-100 p-4 text-center text-sm text-slate-400">
                Cette conversation est fermée
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600 mb-1">
                Aucune conversation sélectionnée
              </p>
              <p className="text-sm">
                Cliquez sur une conversation pour commencer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
