import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "../styles/PremiumDashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const res = await API.get("chat/dashboard-stats/");
      setStats(res.data);
    } catch (err) {
      console.log("Dashboard error:", err);
      setError("Dashboard API failed. Check backend server.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return (
      <div className="premium-dashboard-page">
        <div className="dashboard-error-box">
          <h2>⚠️ {error}</h2>
          <button onClick={loadDashboard}>Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="premium-dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-badge">REAL AI AGENT DASHBOARD</span>
          <h1>Welcome, {stats.username}</h1>
          <p>
            Track chats, tools, files, AI models, system health, and recent activity.
          </p>
        </div>

        <div className="hero-actions">
          <Link to="/chat">Start Chat</Link>
          <Link to="/agent-tools">Agent Tools</Link>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-icon">💬</div>
          <h2>{stats.total_chats}</h2>
          <p>Total Messages</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-icon">🧠</div>
          <h2>{stats.total_conversations}</h2>
          <p>Conversations</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-icon">📎</div>
          <h2>{stats.total_files}</h2>
          <p>Uploaded Files</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-icon">🧩</div>
          <h2>{stats.total_tools}</h2>
          <p>AI Tools</p>
        </div>
      </section>

      <section className="dashboard-system-grid">
        <div className="system-card">
          <h3>System Status</h3>

          <div className="system-row">
            <span>Backend</span>
            <strong className="online">{stats.backend_status}</strong>
          </div>

          <div className="system-row">
            <span>Frontend</span>
            <strong>{stats.frontend}</strong>
          </div>

          <div className="system-row">
            <span>Backend Stack</span>
            <strong>{stats.backend}</strong>
          </div>

          <div className="system-row">
            <span>Database</span>
            <strong>{stats.database}</strong>
          </div>

          <div className="system-row">
            <span>Authentication</span>
            <strong>{stats.auth}</strong>
          </div>
        </div>

        <div className="system-card">
          <h3>AI Models</h3>

          <div className="model-list">
            {stats.ai_models.map((model) => (
              <div className="model-chip" key={model}>
                {model === "Groq" ? "⚡" : model === "Gemini" ? "✨" : "🤖"} {model}
              </div>
            ))}
          </div>

          <p className="system-note">
            Your AI workspace supports chat, code generation, file AI, image generation,
            memory, task planning, and settings.
          </p>
        </div>
      </section>

      <section className="dashboard-tools-grid">
        {stats.tools.map((tool) => (
          <Link to={tool.path} className="tool-mini-card" key={tool.title}>
            <span>{tool.icon}</span>
            <div>
              <h4>{tool.title}</h4>
              <p>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="dashboard-recent-grid">
        <div className="recent-card">
          <h3>Recent Conversations</h3>

          {stats.recent_conversations.length === 0 ? (
            <p className="empty-dashboard-text">No conversations yet.</p>
          ) : (
            stats.recent_conversations.map((conv) => (
              <div className="recent-item" key={conv.id}>
                <strong>{conv.title}</strong>
                <span>{new Date(conv.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        <div className="recent-card">
          <h3>Recent Chats</h3>

          {stats.recent_chats.length === 0 ? (
            <p className="empty-dashboard-text">No chats yet.</p>
          ) : (
            stats.recent_chats.map((chat) => (
              <div className="recent-item" key={chat.id}>
                <strong>{chat.user_message.slice(0, 70)}...</strong>
                <span>{new Date(chat.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;