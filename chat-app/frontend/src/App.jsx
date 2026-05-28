import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import ClientChat from "./pages/ClientChat";
import AgentDashboard from "./pages/AgentDashboard";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) return <Navigate to="/login" />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute role={["client", "admin", "superAdmin"]}>
              <ClientChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute role={["agent", "admin", "superAdmin"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role={["admin", "superAdmin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
