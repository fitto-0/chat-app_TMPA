import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#06b6d4"];

function Avatar({ name = "?", size = "md" }) {
  const color = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const cls = `avatar avatar-${size}`;
  return (
    <div className={cls} style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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
            <img src={logo} alt="TMPA Logo" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => { setActiveTab("create"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Créer un agent
          </button>
          <button
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => { setActiveTab("agents"); setSidebarOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Liste des agents
            {agents.length > 0 && <span className="nav-badge">{agents.length}</span>}
          </button>
        </nav>

        <div className="sidebar-user">
          <Avatar name={user.nom} size="sm" />
          <div className="sidebar-user-info">
            <p>{user.nom}</p>
            <span>
              <span className="status-dot status-online" style={{ width: 6, height: 6 }} />
              Administrateur
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="admin-main">
        <div className="admin-main-header">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu-btn btn-ghost"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h2>{activeTab === "create" ? "Créer un agent" : "Liste des agents"}</h2>
              <p>
                {activeTab === "create"
                  ? "Ajouter un nouvel agent pour gérer les conversations."
                  : `${agents.length} agent(s) enregistré(s)`}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === "create" ? (
            <div className="admin-form-card card-flat" style={{ padding: "1.75rem" }}>
              {error && <div className="auth-error" style={{ marginBottom: "1rem" }}>{error}</div>}
              {success && <div className="auth-success" style={{ marginBottom: "1rem" }}>{success}</div>}

              <form className="admin-form" onSubmit={createAgent}>
                <div className="auth-input-group">
                  <label htmlFor="agent-nom">Nom de l'agent</label>
                  <input
                    id="agent-nom"
                    type="text"
                    placeholder="Nom complet"
                    value={form.nom}
                    required
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="auth-input-group">
                  <label htmlFor="agent-email">Email</label>
                  <input
                    id="agent-email"
                    type="email"
                    placeholder="agent@email.com"
                    value={form.email}
                    required
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="auth-input-group">
                  <label htmlFor="agent-password">Mot de passe</label>
                  <input
                    id="agent-password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    required
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ marginTop: "0.5rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Création...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Créer l'agent
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="agent-list">
              {agents.length === 0 ? (
                <div className="conv-empty" style={{ minHeight: "200px" }}>
                  <div className="conv-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Aucun agent créé</p>
                  <p style={{ fontSize: "0.85rem" }}>Créez votre premier agent depuis l'onglet "Créer un agent".</p>
                </div>
              ) : (
                agents.map((agent, idx) => (
                  <div
                    key={agent._id}
                    className="agent-card animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="agent-card-info">
                      <Avatar name={agent.nom} size="lg" />
                      <div>
                        <p>{agent.nom}</p>
                        <span>{agent.email}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteAgent(agent._id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
