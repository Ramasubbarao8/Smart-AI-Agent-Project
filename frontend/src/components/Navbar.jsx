import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/PremiumNavbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user")) || null;

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
    window.location.reload();
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="premium-navbar">
      <Link to="/" className="premium-logo" onClick={closeMenu}>
        <div className="logo-icon-wrapper">
          <span className="logo-icon">🤖</span>
        </div>

        <div className="logo-text">
          <h2>Smart AI Agent</h2>
          <span>Premium AI Workspace</span>
        </div>
      </Link>

      <button
        className="navbar-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={menuOpen ? "navbar-links open" : "navbar-links"}>
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>

        {token && (
          <>
            <NavLink to="/dashboard" onClick={closeMenu}>
              Dashboard
            </NavLink>

            <NavLink to="/chat" onClick={closeMenu}>
              Chat
            </NavLink>

            <NavLink to="/agent-tools" onClick={closeMenu}>
              Tools
            </NavLink>

            <NavLink to="/history" onClick={closeMenu}>
              History
            </NavLink>

            <NavLink to="/profile" onClick={closeMenu}>
              Profile
            </NavLink>
          </>
        )}

        {!token ? (
          <div className="navbar-auth">
            <Link to="/login" onClick={closeMenu} className="nav-login">
              Login
            </Link>

            <Link to="/register" onClick={closeMenu} className="nav-register">
              Create Account
            </Link>
          </div>
        ) : (
          <div className="navbar-user">
            <span>{user?.username || "User"}</span>

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;