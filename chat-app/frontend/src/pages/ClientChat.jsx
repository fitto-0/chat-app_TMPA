import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import ChatIcon from "@mui/icons-material/Chat";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import { isOwnMessage as checkOwnMessage } from "../utils/messageHelpers";
import logo from "../assets/logo.png";

export default function ClientChat() {
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const isOwnMessage = useCallback(
    (msg) => checkOwnMessage(msg, user?.id),
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

    socket.emit("join", user.id);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
      if (data.conversationId) setConversationId(data.conversationId);
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

    socket.on("conversationClosed", () => setIsClosed(true));

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("conversationClosed");
    };
  }, [user, isOwnMessage]);

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
      const res = await axios.post("/messages/send", { contenu });
      setConversationId(res.data.conversation._id);
      setMessages((prev) => [...prev, res.data.message]);
      socket.emit("joinConversation", res.data.conversation._id);
      setIsClosed(false);
      setContenu("");
      setShowWelcome(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMessages([]);
    setConversationId(null);
    setIsClosed(false);
    setShowWelcome(true);
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 6, md: 10 },
          px: 2,
          maxWidth: 720,
          mx: "auto",
          filter: isOpen ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <Box component="img" src={logo} alt="Tanger Med" sx={{ maxWidth: 180, mb: 3 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Bienvenue sur le Support Tanger Med
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
          Notre équipe est disponible pour répondre à vos questions et vous
          accompagner dans vos démarches.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="https://www.tangermedport.com/en/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visiter le site officiel
        </Button>
      </Box>

      {!isOpen ? (
        <Fab
          color="primary"
          onClick={() => setIsOpen(true)}
          title="Ouvrir le support"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
          }}
        >
          <ChatIcon sx={{ fontSize: 32 }} />
        </Fab>
      ) : (
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: { xs: "calc(100% - 32px)", sm: 380 },
            height: { xs: "calc(100vh - 48px)", sm: 560 },
            maxHeight: "calc(100vh - 48px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ChatIcon />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Support en direct
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  ● En ligne - réponse rapide
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white", minWidth: 0 }}>
                <ExpandMoreIcon />
              </IconButton>
              {user ? (
                <IconButton size="small" onClick={handleLogout} sx={{ color: "white", minWidth: 0 }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button size="small" onClick={() => navigate("/login")} sx={{ color: "white" }}>
                  Se connecter
                </Button>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 2, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              {user ? (
                <>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Bienvenue, {user.nom} 👋
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connecté en tant que{" "}
                    <Typography component="span" color="primary.main" fontWeight={600}>
                      {user.role}
                    </Typography>
                    . Envoyez un message pour démarrer.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Bienvenue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connectez-vous pour accéder au support.
                  </Typography>
                </>
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(messages.length === 0 && showWelcome) ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Prêt à vous aider
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tapez votre question ci-dessous pour contacter un agent.
                </Typography>
              </Box>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={msg._id || idx}
                  msg={msg}
                  isOwn={isOwnMessage(msg)}
                  avatarName={isOwnMessage(msg) ? user?.nom : "Agent"}
                  showAvatar={!isOwnMessage(msg)}
                />
              ))
            )}
            <div ref={bottomRef} />
          </Box>

          {isClosed && (
            <Alert severity="warning" sx={{ borderRadius: 0 }}>
              Conversation fermée — un agent a clôturé cette discussion.
            </Alert>
          )}

          <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Écrire un message..."
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isClosed}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!contenu.trim() || isClosed || loading}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
