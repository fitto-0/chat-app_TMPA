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
    <div className="dashboard" style={{ padding: "1rem" }}>
      <section className="sidebar fade-in-up" style={{ minHeight: "auto" }}>
        <div className="sidebar-logo">
          <div className="avatar" style={{ backgroundColor: "#8b5cf6" }}>
            A
          </div>
          <div>
            <p className="font-bold">ChatSupport</p>
            <p className="panel-subtitle">Administration</p>
          </div>
        </div>
        <div className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Créer un agent
          </button>
          <button
            className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
            onClick={() => setActiveTab("agents")}
          >
            Liste des agents
            <span className="nav-badge">{agents.length}</span>
          </button>
        </div>
        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{ backgroundColor: "#2563eb" }}>
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="font-bold">{user.nom}</p>
            <p className="panel-subtitle">Administrateur</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </section>

      <section className="sidebar-panel fade-in-up" style={{ gridColumn: "span 2" }}>
        <div className="panel-header" style={{ padding: "1.5rem 1.5rem 0.8rem" }}>
          <div>
            <h2 className="panel-title">{activeTab === "create" ? "Créer un agent" : "Liste des agents"}</h2>
            <p className="panel-subtitle">
              {activeTab === "create"
                ? "Ajouter un nouvel agent pour gérer les conversations."
                : "Gérez les agents de support existants."}
            </p>
          </div>
        </div>

        <div className="panel-content" style={{ paddingTop: 0 }}>
          {activeTab === "create" ? (
            <div className="glass-card" style={{ padding: "1.75rem" }}>
              {error && (
                <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1rem", borderRadius: "1rem" }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ background: "#ecfccb", color: "#15803d", padding: "1rem", borderRadius: "1rem" }}>
                  {success}
                </div>
              )}
              <form style={{ display: "grid", gap: "1rem" }} onSubmit={createAgent}>
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom"
                  value={form.nom}
                  required
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="input-field"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                />
                <button type="submit" className="button-primary" disabled={loading}>
                  {loading ? "Création..." : "Créer un agent"}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              {agents.length === 0 ? (
                <p className="panel-subtitle">Aucun agent créé pour le moment.</p>
              ) : (
                <div className="grid" style={{ gap: "1rem" }}>
                  {agents.map((agent) => (
                    <div key={agent._id} className="conversation-card">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{agent.nom}</p>
                          <p className="panel-subtitle">{agent.email}</p>
                        </div>
                        <button
                          className="button-secondary"
                          onClick={() => deleteAgent(agent._id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
