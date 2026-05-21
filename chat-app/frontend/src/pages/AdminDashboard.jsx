import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");

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
      setSuccess("Agent créé avec succès!");
      setForm({ nom: "", email: "", password: "" });
      fetchAgents();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm("Supprimer cet agent?")) return;
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
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <span>ChatSupport</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Créer un agent
          </button>
          <button
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => setActiveTab("agents")}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Liste des agents
            <span className="nav-badge">{agents.length}</span>
          </button>
        </nav>
        <div className="sidebar-user">
          <div
            className="avatar avatar-sm"
            style={{ backgroundColor: "#8B5CF6" }}
          >
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <p>{user.nom}</p>
            <span>● Admin</span>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Main Content */}
      <div className="chat-area" style={{ padding: "2rem", overflowY: "auto" }}>
        {/* ===== TAB: CREATE ===== */}
        {activeTab === "create" && (
          <>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "2rem",
              }}
            >
              Créer un nouvel agent
            </h1>
            <div
              style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid var(--color-border-tertiary)",
                maxWidth: "500px",
              }}
            >
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#ef4444",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  style={{
                    background: "#f0fdf4",
                    color: "#22c55e",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {success}
                </div>
              )}
              <form
                onSubmit={createAgent}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Nom"
                  value={form.nom}
                  required
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "2px solid var(--color-border-tertiary)",
                    borderRadius: "0.75rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    color: "var(--color-text-primary)",
                    background: "var(--color-background-primary)",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    padding: "0.75rem 1rem",
                    border: "2px solid var(--color-border-tertiary)",
                    borderRadius: "0.75rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    color: "var(--color-text-primary)",
                    background: "var(--color-background-primary)",
                  }}
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  required
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={{
                    padding: "0.75rem 1rem",
                    border: "2px solid var(--color-border-tertiary)",
                    borderRadius: "0.75rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    color: "var(--color-text-primary)",
                    background: "var(--color-background-primary)",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.75rem",
                    background: loading ? "#93c5fd" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.75rem",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Création..." : "Créer l'agent"}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ===== TAB: AGENTS LIST ===== */}
        {activeTab === "agents" && (
          <>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "2rem",
              }}
            >
              Liste des agents
            </h1>
            <div
              style={{
                background: "white",
                borderRadius: "1rem",
                border: "1px solid var(--color-border-tertiary)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid var(--color-border-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Agents
                </h2>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#3b82f6",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                  }}
                >
                  {agents.length} agent{agents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {agents.length === 0 ? (
                <div
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <p style={{ fontSize: "0.875rem" }}>Aucun agent créé</p>
                </div>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent._id}
                    style={{
                      padding: "1rem 1.5rem",
                      borderBottom: "1px solid var(--color-border-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      className="avatar avatar-md"
                      style={{ backgroundColor: "#3b82f6" }}
                    >
                      {agent.nom.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {agent.nom}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {agent.email}
                      </p>
                    </div>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: agent.isOnline ? "#22c55e" : "#94a3b8",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: agent.isOnline ? "#22c55e" : "#94a3b8",
                          display: "inline-block",
                        }}
                      ></span>
                      {agent.isOnline ? "En ligne" : "Hors ligne"}
                    </span>
                    <span
                      style={{
                        background: "#f0fdf4",
                        color: "#22c55e",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                      }}
                    >
                      Agent
                    </span>
                    <button
                      onClick={() => deleteAgent(agent._id)}
                      style={{
                        background: "#fef2f2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
