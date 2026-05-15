import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/PremiumProfile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      const res = await API.get("chat/profile/");
      setProfile(res.data);
    } catch (err) {
      console.log("Profile error:", err);
      setError("Profile API failed. Check backend profile endpoint.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
    window.location.reload();
  }

  function exportProfile() {
    const text = `
AI AGENT PROFILE

Username: ${profile.username}
Email: ${profile.email}
Total Chats: ${profile.total_chats}
Total Conversations: ${profile.total_conversations}
Total Files: ${profile.total_files}
Total Memories: ${profile.total_memories}
Auth: JWT Secured
Frontend: React + Vite
Backend: Django REST Framework
`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-agent-profile.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="premium-profile-page">
        <div className="profile-loading-card">
          <h2>⚠️ {error}</h2>
          <button onClick={loadProfile}>Retry</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="premium-profile-page">
        <div className="profile-loading-card">
          <div className="loading-circle"></div>
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-profile-page">
      <div className="profile-glow profile-glow-one"></div>
      <div className="profile-glow profile-glow-two"></div>

      <div className="premium-profile-wrapper">
        <div className="premium-profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {profile.username ? profile.username[0].toUpperCase() : "U"}
            </div>

            <div>
              <span className="profile-badge">REAL AI AGENT USER</span>

              <h1>{profile.username}</h1>

              <p>{profile.email || "No email available"}</p>
            </div>

            <div className="profile-actions">
              <button onClick={exportProfile}>Export</button>
              <button className="logout-profile-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="stat-icon">💬</div>
              <h2>{profile.total_chats}</h2>
              <span>Total Messages</span>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">🧠</div>
              <h2>{profile.total_conversations}</h2>
              <span>Conversations</span>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">📎</div>
              <h2>{profile.total_files}</h2>
              <span>Uploaded Files</span>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">📝</div>
              <h2>{profile.total_memories}</h2>
              <span>Memory Notes</span>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">⚡</div>
              <h2>Groq</h2>
              <span>Fast AI Model</span>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">✨</div>
              <h2>Gemini</h2>
              <span>Smart AI Model</span>
            </div>
          </div>

          <div className="profile-tools-panel">
            <h3>Your AI Workspace</h3>

            <div className="profile-tools-grid">
              <Link to="/chat">💬 Chat</Link>
              <Link to="/agent-tools">🧩 Tools</Link>
              <Link to="/file-ai">📎 File AI</Link>
              <Link to="/code-generator">💻 Code</Link>
              <Link to="/memory">🧠 Memory</Link>
              <Link to="/history">📜 History</Link>
              <Link to="/ai-settings">⚙️ Settings</Link>
              <Link to="/task-planner">✅ Tasks</Link>
            </div>
          </div>

          <div className="profile-about-card">
            <h3>About Your Smart AI Agent</h3>

            <p>
              This is a premium full-stack Smart AI Agent application built with
              React frontend, Django REST Framework backend, JWT authentication,
              Groq AI, Gemini AI, file AI, image generation, chat history,
              memory notes, profile analytics, and professional AI dashboard UI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;