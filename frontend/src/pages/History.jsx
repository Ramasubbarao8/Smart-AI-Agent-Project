import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import API from "../api";
import "../styles/PremiumHistory.css";

function History() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadHistory(searchText = "") {
    try {
      setLoading(true);

      const res = await API.get(`chat/history/?search=${searchText}`);
      setChats(res.data);
    } catch (err) {
      console.log("History error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    loadHistory(value);
  }

  async function deleteChat(chatId) {
    if (!window.confirm("Delete this chat?")) return;

    try {
      await API.delete(`chat/delete/${chatId}/`);
      setChats((oldChats) => oldChats.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.log("Delete error:", err);
      alert("Failed to delete chat.");
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text || "");
    alert("Copied!");
  }

  function continueChat(chat) {
    localStorage.setItem("continueConversationId", chat.conversation);
    navigate("/chat");
  }

  function exportHistory() {
    const text = chats
      .map(
        (chat, index) =>
          `CHAT #${index + 1}\n\nUSER:\n${chat.user_message}\n\nAI:\n${chat.ai_response}\n\nDATE:\n${chat.created_at}\n\n---------------------\n`
      )
      .join("");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-chat-history.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function renderMarkdown(text) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <div className="history-code-block">
                <div className="history-code-top">
                  <span>{match[1]}</span>
                  <button onClick={() => copyText(String(children))}>Copy</button>
                </div>

                <SyntaxHighlighter language={match[1]} style={oneDark} PreTag="div">
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text || ""}
      </ReactMarkdown>
    );
  }

  const filteredChats = chats.filter((chat) => {
    if (filter === "all") return true;

    const text = `${chat.user_message} ${chat.ai_response}`.toLowerCase();

    if (filter === "code") {
      return text.includes("```") || text.includes("function") || text.includes("class ");
    }

    if (filter === "errors") {
      return text.includes("error") || text.includes("failed") || text.includes("exception");
    }

    if (filter === "projects") {
      return text.includes("project") || text.includes("frontend") || text.includes("backend");
    }

    return true;
  });

  return (
    <div className="premium-history-page">
      <div className="premium-history-header">
        <div>
          <span className="history-badge">REAL AI AGENT HISTORY</span>
          <h1>Chat History</h1>
          <p>Search, continue, copy, export, and manage your AI conversations.</p>
        </div>

        <div className="history-count-card">
          <h2>{filteredChats.length}</h2>
          <span>Chats Found</span>
        </div>
      </div>

      <div className="history-toolbar">
        <input
          type="text"
          placeholder="Search your chat history..."
          value={search}
          onChange={handleSearch}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Chats</option>
          <option value="code">Code Chats</option>
          <option value="errors">Error Fixes</option>
          <option value="projects">Projects</option>
        </select>

        <button onClick={exportHistory}>Export</button>
      </div>

      {loading ? (
        <div className="history-empty-card">
          <div className="history-loader"></div>
          <h2>Loading history...</h2>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="history-empty-card">
          <div className="empty-icon">📜</div>
          <h2>No chat history found</h2>
          <p>Start chatting or try another search keyword.</p>
          <button onClick={() => navigate("/chat")}>Start Chat</button>
        </div>
      ) : (
        <div className="premium-history-list">
          {filteredChats.map((chat, index) => (
            <div className="premium-history-card" key={chat.id}>
              <div className="history-card-top">
                <div>
                  <span className="chat-number">Chat #{index + 1}</span>
                  <h3>{chat.user_message?.slice(0, 75)}...</h3>
                </div>

                <span className="history-time">
                  {new Date(chat.created_at).toLocaleString()}
                </span>
              </div>

              <div className="history-section user-section">
                <div className="history-section-title">
                  <strong>🧑 You</strong>

                  <div className="history-action-buttons">
                    <button onClick={() => copyText(chat.user_message)}>Copy</button>

                    <button onClick={() => continueChat(chat)}>Continue</button>

                    <button
                      className="history-delete-btn"
                      onClick={() => deleteChat(chat.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p>{chat.user_message}</p>
              </div>

              <div className="history-section ai-section">
                <div className="history-section-title">
                  <strong>🤖 AI Agent</strong>

                  <button onClick={() => copyText(chat.ai_response)}>Copy</button>
                </div>

                <div className="markdown-answer">{renderMarkdown(chat.ai_response)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;