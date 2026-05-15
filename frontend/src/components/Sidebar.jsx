import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClearChat,
  open,
  setOpen,
}) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  function openTool(action) {
    localStorage.setItem("selectedTool", action);
    navigate("/chat");
    if (window.innerWidth <= 768) setOpen(false);
  }

  function closeMobile() {
    if (window.innerWidth <= 768) setOpen(false);
  }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={open ? "agent-sidebar open-sidebar" : "agent-sidebar closed-sidebar"}>
        <button className="hamburger-btn" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>

        {open && (
          <>
            <div className="sidebar-brand">
              <div className="brand-icon">🤖</div>
              <div>
                <h2>Smart AI</h2>
                <p>ChatGPT style workspace</p>
              </div>
            </div>

            <div className="agent-actions">
              <button className="new-chat-agent-btn" onClick={onNewConversation}>
                + New Chat
              </button>
              <button className="clear-agent-btn" onClick={onClearChat}>
                Clear
              </button>
            </div>

            <div className="quick-agent-tools">
              <button onClick={() => openTool("code")}>💻 Code</button>
              <button onClick={() => openTool("image")}>🖼 Image</button>
              <button onClick={() => openTool("file")}>📎 File</button>
              <button onClick={() => openTool("debug")}>🛠 Debug</button>
            </div>

            <div className="agent-menu">
              <span className="menu-title">Workspace</span>

              <NavLink to="/dashboard" onClick={closeMobile}>📊 Dashboard</NavLink>
              <NavLink to="/chat" onClick={closeMobile}>💬 Chat</NavLink>
              <NavLink to="/agent-tools" onClick={closeMobile}>🧩 Agent Tools</NavLink>
              <NavLink to="/file-ai" onClick={closeMobile}>📎 File AI</NavLink>
              <NavLink to="/code-generator" onClick={closeMobile}>💻 Code Generator</NavLink>
              <NavLink to="/memory" onClick={closeMobile}>🧠 Memory</NavLink>
              <NavLink to="/task-planner" onClick={closeMobile}>✅ Task Planner</NavLink>
              <NavLink to="/history" onClick={closeMobile}>📜 History</NavLink>
              <NavLink to="/profile" onClick={closeMobile}>👤 Profile</NavLink>
              <NavLink to="/ai-settings" onClick={closeMobile}>⚙️ Settings</NavLink>
            </div>

            <div className="agent-conversations">
              <div className="conversation-top">
                <span className="menu-title">Recent Chats</span>
                <button onClick={onNewConversation}>+</button>
              </div>

              {conversations.length === 0 ? (
                <div className="empty-conversations">
                  <p>No conversations yet</p>
                  <small>Start a new chat to create one.</small>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={
                      activeConversationId === conv.id
                        ? "agent-conversation active-agent-conversation"
                        : "agent-conversation"
                    }
                  >
                    <button
                      onClick={() => {
                        onSelectConversation(conv.id);
                        closeMobile();
                      }}
                    >
                      <span>💬</span>
                      <b>{conv.title || "New Chat"}</b>
                    </button>

                    <span
                      className="delete-conv"
                      onClick={() => onDeleteConversation(conv.id)}
                    >
                      ×
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="agent-sidebar-footer">
              <div className="footer-user">
                <div className="user-avatar">
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </div>

                <div>
                  <h4>{user.username || "User"}</h4>
                  <p>Online • JWT secured</p>
                </div>
              </div>

              <button className="sidebar-logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default Sidebar;