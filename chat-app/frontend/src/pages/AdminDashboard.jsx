import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import UserAvatar from "../components/UserAvatar";
import logo from "../assets/logo.png";

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get("/auth/agents");
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createAgent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post("/auth/agents", form);
      setSuccess("Agent créé avec succès !");
      setForm({ nom: "", email: "", password: "" });
      fetchAgents();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm("Supprimer cet agent ?")) return;
    try {
      await axios.delete(`/auth/agents/${id}`);
      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { id: "create", label: "Créer un agent", icon: <PersonAddIcon /> },
    {
      id: "agents",
      label: "Liste des agents",
      icon: <GroupIcon />,
      badge: agents.length || null,
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        logo={logo}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        user={user}
        roleLabel="Administrateur"
        onLogout={handleLogout}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton sx={{ display: { md: "none" } }} onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {activeTab === "create" ? "Créer un agent" : "Liste des agents"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === "create"
                  ? "Ajouter un nouvel agent pour gérer les conversations."
                  : `${agents.length} agent(s) enregistré(s)`}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflowY: "auto" }}>
          {activeTab === "create" ? (
            <Paper sx={{ p: 3, maxWidth: 520 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={createAgent}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Nom de l'agent"
                  value={form.nom}
                  required
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Mot de passe"
                  type="password"
                  value={form.password}
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />
                  }
                  sx={{ alignSelf: "flex-start" }}
                >
                  {loading ? "Création..." : "Créer l'agent"}
                </Button>
              </Box>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {agents.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <GroupIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography fontWeight={600}>Aucun agent créé</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Créez votre premier agent depuis l'onglet "Créer un agent".
                  </Typography>
                </Paper>
              ) : (
                agents.map((agent) => (
                  <Paper
                    key={agent._id}
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <UserAvatar name={agent.nom} size="lg" />
                      <Box>
                        <Typography fontWeight={600}>{agent.nom}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {agent.email}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteAgent(agent._id)}
                    >
                      Supprimer
                    </Button>
                  </Paper>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
