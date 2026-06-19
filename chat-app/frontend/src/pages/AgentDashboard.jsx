import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ListItemButton from "@mui/material/ListItemButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ChatIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import axios from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import SeenStatus from "../components/SeenStatus";
import UserAvatar from "../components/UserAvatar";
import formatTime from "../utils/formatTime";
import logo from "../assets/logo.png";

const statusColor = {
  active: "success",
  pending: "warning",
  closed: "default",
};

export default function AgentDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [mobilePanel, setMobilePanel] = useState("list");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isOwnMessage = useCallback(
    (msg) => user && (msg.senderId?._id === user.id || msg.senderId === user.id),
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

    socket.on("messagesSeen", (data) => {
      if (selected && data.conversationId?.toString() !== selected._id?.toString()) return;
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

    return () => {
      socket.off("newConversation");
      socket.off("newMessage");
      socket.off("messagesSeen");
    };
  }, [selected, user, isOwnMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selected) return;
    const hasUnreadFromOther = messages.some(
      (msg) => !isOwnMessage(msg) && !msg.isRead,
    );
    if (hasUnreadFromOther) markAsRead(selected._id);
  }, [selected, messages, isOwnMessage, markAsRead]);

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
      await axios.post(`/messages/conversations/${selected._id}/reply`, { contenu });
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
  const displayedConvs = activeTab === "conversations" ? activeConvs : closedConvs;

  const navItems = [
    {
      id: "conversations",
      label: "Conversations",
      icon: <ChatIcon />,
      badge: activeConvs.length || null,
    },
    {
      id: "history",
      label: "Historique",
      icon: <HistoryIcon />,
    },
  ];

  const showList = !isMobile || mobilePanel === "list";
  const showChat = !isMobile || mobilePanel === "chat";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        logo={logo}
        subtitle="Tableau agent"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobilePanel("list");
          setSidebarOpen(false);
        }}
        user={user}
        roleLabel="En ligne"
        onLogout={handleLogout}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minWidth: 0,
          ml: { md: 0 },
        }}
      >
        {showList && (
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 320 },
              borderRight: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  sx={{ display: { md: "none" } }}
                  onClick={() => setSidebarOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                      {activeTab === "conversations" ? "Conversations" : "Historique"}
                    </Typography>
                    <Chip label={displayedConvs.length} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {activeTab === "conversations"
                      ? "Discussions actives"
                      : "Discussions terminées"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {displayedConvs.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography fontWeight={600}>Aucune discussion</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendez qu'un client démarre une conversation.
                  </Typography>
                </Box>
              ) : (
                displayedConvs.map((conv) => (
                  <ListItemButton
                    key={conv._id}
                    selected={selected?._id === conv._id}
                    onClick={() => openConversation(conv)}
                    sx={{
                      py: 1.5,
                      alignItems: "flex-start",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <UserAvatar name={conv.clientId?.nom || "C"} size="md" />
                    <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {conv.clientId?.nom || "Client"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(conv.updatedAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                        {conv.lastMessage || "Message initial..."}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          label={conv.priority || "normal"}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={conv.status}
                          size="small"
                          color={statusColor[conv.status] || "default"}
                        />
                      </Stack>
                    </Box>
                  </ListItemButton>
                ))
              )}
            </Box>
          </Paper>
        )}

        {showChat && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {selected ? (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconButton
                      sx={{ display: { md: "none" } }}
                      onClick={() => {
                        setSelected(null);
                        setMobilePanel("list");
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <UserAvatar name={selected.clientId?.nom || "C"} size="lg" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {selected.clientId?.nom || "Client"}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        ● {selected.subject || "Support client"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={closeConversation}
                  >
                    Fermer
                  </Button>
                </Paper>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {messages.length === 0 ? (
                    <Box sx={{ textAlign: "center", pt: 6 }}>
                      <Typography variant="h6">Conversation ouverte</Typography>
                      <Typography color="text.secondary">
                        Rédigez une réponse pour démarrer la discussion.
                      </Typography>
                    </Box>
                  ) : (
                    messages.map((msg, idx) => {
                      const isAgent = isOwnMessage(msg);
                      return (
                        <Stack
                          key={msg._id || idx}
                          direction="row"
                          spacing={1}
                          justifyContent={isAgent ? "flex-end" : "flex-start"}
                          alignItems="flex-end"
                        >
                          {!isAgent && (
                            <UserAvatar name={selected.clientId?.nom || "C"} size="sm" />
                          )}
                          <Box sx={{ maxWidth: "70%" }}>
                            <Paper
                              elevation={0}
                              sx={{
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                borderBottomRightRadius: isAgent ? 4 : 16,
                                borderBottomLeftRadius: isAgent ? 16 : 4,
                                bgcolor: isAgent ? "primary.main" : "background.paper",
                                color: isAgent ? "white" : "text.primary",
                                border: isAgent ? "none" : 1,
                                borderColor: "divider",
                              }}
                            >
                              <Typography variant="body2">{msg.contenu}</Typography>
                            </Paper>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent={isAgent ? "flex-end" : "flex-start"}
                              sx={{ mt: 0.25, px: 0.5 }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(msg.createdAt)}
                              </Typography>
                              {isAgent && <SeenStatus isRead={msg.isRead} />}
                            </Stack>
                          </Box>
                          {isAgent && <UserAvatar name={user.nom} size="sm" />}
                        </Stack>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </Box>

                <Paper
                  elevation={0}
                  sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}
                >
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Répondre au client..."
                      value={contenu}
                      onChange={(e) => setContenu(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && replyMessage()}
                    />
                    <Button
                      variant="contained"
                      onClick={replyMessage}
                      disabled={!contenu.trim()}
                      endIcon={<SendIcon />}
                    >
                      Envoyer
                    </Button>
                  </Stack>
                </Paper>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <ChatIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Sélectionnez une conversation
                </Typography>
                <Typography color="text.secondary">
                  Les messages du client apparaîtront ici une fois la session ouverte.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
