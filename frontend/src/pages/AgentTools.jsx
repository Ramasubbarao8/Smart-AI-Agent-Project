import { useNavigate } from "react-router-dom";
import "../styles/AgentTools.css";

function AgentTools() {
  const navigate = useNavigate();

  const tools = [
    {
      icon: "💬",
      title: "AI Chat",
      desc: "Ask anything like ChatGPT: coding, projects, interview prep.",
      path: "/chat",
      action: "chat",
      tag: "Core",
    },
    {
      icon: "📎",
      title: "File AI",
      desc: "Upload PDF, DOCX, TXT, or image and ask questions.",
      path: "/chat",
      action: "file",
      tag: "Files",
    },
    {
      icon: "💻",
      title: "Code Expert",
      desc: "Generate full React, Django, Python, SQL, Java code.",
      path: "/chat",
      action: "code",
      tag: "Developer",
    },
    {
      icon: "🛠️",
      title: "Debug Assistant",
      desc: "Paste any error and get exact fixed code step by step.",
      path: "/chat",
      action: "debug",
      tag: "Fix",
    },
    {
      icon: "🖼️",
      title: "Image Generator",
      desc: "Create AI images from prompts like Gemini or ChatGPT.",
      path: "/chat",
      action: "image",
      tag: "Creative",
    },
    {
      icon: "🌐",
      title: "Web Research",
      desc: "Search-style answers for latest topics and explanations.",
      path: "/chat",
      action: "web",
      tag: "Research",
    },
    {
      icon: "🎯",
      title: "Interview Coach",
      desc: "Prepare answers, DSA, HR questions, and project explanation.",
      path: "/chat",
      action: "interview",
      tag: "Career",
    },
    {
      icon: "🧠",
      title: "Memory",
      desc: "Save project notes, ideas, tasks, and reusable context.",
      path: "/memory",
      tag: "Notes",
    },
    {
      icon: "✅",
      title: "Task Planner",
      desc: "Plan project tasks, deadlines, and development steps.",
      path: "/task-planner",
      tag: "Planner",
    },
    {
      icon: "⚙️",
      title: "AI Settings",
      desc: "Control model, response style, and AI behavior.",
      path: "/ai-settings",
      tag: "Config",
    },
    {
      icon: "📜",
      title: "History",
      desc: "View, continue, and manage old conversations.",
      path: "/history",
      tag: "Saved",
    },
  ];

  function openTool(tool) {
    if (tool.action) {
      localStorage.setItem("selectedTool", tool.action);
    } else {
      localStorage.removeItem("selectedTool");
    }

    navigate(tool.path);
  }

  return (
    <div className="agent-tools-page">
      <div className="tools-hero">
        <span>REAL AI AGENT WORKSPACE</span>

        <h1>What do you want to do today?</h1>

        <p>
          Choose a tool and continue directly inside your AI chat workspace.
        </p>
      </div>

      <div className="tools-stats">
        <div>
          <strong>11+</strong>
          <span>AI Tools</span>
        </div>

        <div>
          <strong>3</strong>
          <span>Modes: Chat, Web, Image</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>Project Assistant</span>
        </div>
      </div>

      <div className="tools-grid">
        {tools.map((tool, index) => (
          <button className="tool-box" key={index} onClick={() => openTool(tool)}>
            <div className="tool-top">
              <div className="tool-icon">{tool.icon}</div>
              <span className="tool-tag">{tool.tag}</span>
            </div>

            <h2>{tool.title}</h2>
            <p>{tool.desc}</p>

            <div className="tool-action">Open Tool →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AgentTools;