import { Link } from "react-router-dom";
import "../styles/PremiumHome.css";

function Home() {
  const token = localStorage.getItem("access");

  const features = [
    {
      icon: "💬",
      title: "AI Chat",
      text: "Ask anything with markdown, code blocks, voice input, and chat history.",
    },
    {
      icon: "📎",
      title: "File AI",
      text: "Upload PDF, DOCX, TXT, and images. Ask questions from your files.",
    },
    {
      icon: "🖼️",
      title: "Image Generator",
      text: "Generate AI images from prompts using your image tool mode.",
    },
    {
      icon: "💻",
      title: "Code Expert",
      text: "Generate React, Django, Python, SQL, and full-stack project code.",
    },
    {
      icon: "📜",
      title: "Smart History",
      text: "Search, copy, export, delete, and continue your old conversations.",
    },
    {
      icon: "⚙️",
      title: "AI Settings",
      text: "Control model, style, temperature, tokens, and response behavior.",
    },
  ];

  const tools = [
    "Groq Fast AI",
    "Gemini Smart AI",
    "JWT Login",
    "File Reader",
    "Image AI",
    "Code Agent",
  ];

  return (
    <div className="premium-home-page">
      <section className="premium-hero">
        <div className="hero-left">
          <span className="home-badge">REAL AI AGENT PLATFORM</span>

          <h1>
            Build, Chat, Code & Create with your{" "}
            <span>Smart AI Workspace</span>
          </h1>

          <p>
            A ChatGPT and Gemini-style full-stack AI platform built with React,
            Django REST Framework, JWT authentication, Groq, Gemini, file AI,
            image generation, dashboard, history, memory, and agent tools.
          </p>

          <div className="premium-hero-buttons">
            {token ? (
              <>
                <Link to="/chat" className="premium-primary-btn">
                  Start AI Chat
                </Link>

                <Link to="/agent-tools" className="premium-secondary-btn">
                  Open Agent Tools
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="premium-primary-btn">
                  Create Free Account
                </Link>

                <Link to="/login" className="premium-secondary-btn">
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="hero-trust-row">
            <span>✅ Secure JWT</span>
            <span>✅ Real Django APIs</span>
            <span>✅ Premium React UI</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="ai-preview-card">
            <div className="preview-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="preview-title-row">
              <strong>🤖 Smart AI Agent</strong>
              <small>Online</small>
            </div>

            <div className="preview-message user-preview">
              Create full React + Django AI chatbot with login and file upload
            </div>

            <div className="preview-message ai-preview">
              Generating complete folder structure, frontend pages, backend
              APIs, JWT auth, AI chat, File AI, image generation, and dashboard...
            </div>

            <div className="preview-code">
              <span>agent/tools/chat.jsx</span>
              <p>✅ Code generation ready</p>
              <p>✅ File AI connected</p>
              <p>✅ History saved</p>
            </div>

            <div className="preview-tools">
              {tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="premium-stats">
        <div>
          <h2>2+</h2>
          <p>AI Models</p>
        </div>

        <div>
          <h2>10+</h2>
          <p>Agent Tools</p>
        </div>

        <div>
          <h2>24/7</h2>
          <p>AI Assistant</p>
        </div>

        <div>
          <h2>JWT</h2>
          <p>Secure Auth</p>
        </div>
      </section>

      <section className="premium-section-title">
        <span>WORKSPACE FEATURES</span>
        <h2>Everything your AI agent can do</h2>
      </section>

      <section className="premium-features">
        {features.map((item, index) => (
          <div className="premium-feature-card" key={index}>
            <div className="feature-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      <section className="home-workflow">
        <div>
          <span>HOW IT WORKS</span>
          <h2>Simple AI workflow</h2>
        </div>

        <div className="workflow-grid">
          <div>
            <strong>1</strong>
            <h3>Login</h3>
            <p>Create account and access secured AI workspace.</p>
          </div>

          <div>
            <strong>2</strong>
            <h3>Choose Tool</h3>
            <p>Chat, upload files, generate images, code, or plan tasks.</p>
          </div>

          <div>
            <strong>3</strong>
            <h3>Get Output</h3>
            <p>Receive markdown answers, code blocks, summaries, and files.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;