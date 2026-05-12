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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit("join", user.id);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    socket.on("conversationClosed", () => {
      setIsClosed(true);
    });

    return () => {
      socket.off("newMessage");
      socket.off("conversationClosed");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!contenu.trim()) return;
    try {
      const res = await axios.post("/messages/send", { contenu });
      setConversationId(res.data.conversation._id);
      setMessages((prev) => [...prev, res.data.message]);
      setContenu("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Widget */}
      {isOpen && (
        <div
          className="w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-blue-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Discutez avec un Agent
                </p>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full"></span>
                  En Ligne
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
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
                  d="M20 12H4"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
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
                <p className="text-sm text-center">
                  Bonjour! Comment puis-je vous aider?
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe =
                msg.senderId === user.id || msg.senderId?._id === user.id;
              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-0.5 max-w-[200px] ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white text-slate-800 shadow-sm rounded-bl-sm"
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
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {isClosed ? (
            <div className="p-3 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
              Conversation fermée par l'agent
            </div>
          ) : (
            <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-300 transition-all">
                <button className="text-slate-400 flex-shrink-0">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!contenu.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg p-1.5 transition-all flex-shrink-0"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 pb-2 bg-white flex justify-between items-center">
            <span className="text-xs text-slate-300">
              Connecté en tant que {user.nom}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
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
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
