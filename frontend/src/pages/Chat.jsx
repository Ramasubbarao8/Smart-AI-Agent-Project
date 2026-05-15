import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import API from "../api";
import Sidebar from "../components/Sidebar";
import "../styles/PremiumChat.css";

function Chat() {
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [aiMode, setAiMode] = useState("coding");
  const [tool, setTool] = useState("chat");
  const [model, setModel] = useState("auto");
  const [directOnly, setDirectOnly] = useState(true);

  const [loading, setLoading] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [activeFile, setActiveFile] = useState(null);

  const promptSuggestions = [
    "Build full React + Django project with folder structure",
    "Fix this error and give exact modified code",
    "Create REST API with models, serializers, views, urls",
    "Create AI image of futuristic Iron Man",
    "Search web about latest AI tools",
    "Explain this code like beginner",
  ];

  const quickTools = [
    ["💻", "Code", "chat", "coding", "Generate full working code for "],
    ["🛠️", "Debug", "chat", "debug", "Debug this error step by step: "],
    ["🖼️", "Image", "image", "coding", "Create AI image of "],
    ["🌐", "Web", "web", "fast", "Search web about "],
    ["🎯", "Interview", "chat", "interview", "Prepare me for interview on "],
    ["📎", "File AI", "chat", "coding", "Upload file and ask questions"],
  ];

  useEffect(() => {
    const resize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const selectedTool = localStorage.getItem("selectedTool");
    const memoryPrompt = localStorage.getItem("memoryPrompt");

    if (memoryPrompt) {
      setMessage(memoryPrompt);
      localStorage.removeItem("memoryPrompt");
    }

    if (selectedTool === "code") {
      setTool("chat");
      setAiMode("coding");
      setMessage("Generate full working code for ");
    }

    if (selectedTool === "debug") {
      setTool("chat");
      setAiMode("debug");
      setMessage("Debug this error step by step: ");
    }

    if (selectedTool === "interview") {
      setTool("chat");
      setAiMode("interview");
      setMessage("Prepare me for interview on ");
    }

    if (selectedTool === "image") {
      setTool("image");
      setMessage("Create AI image of ");
    }

    if (selectedTool === "web") {
      setTool("web");
      setAiMode("fast");
      setMessage("Search web about ");
    }

    if (selectedTool === "file") {
      setTool("chat");
      setMessage("Upload file and ask questions");
      setTimeout(() => fileInputRef.current?.click(), 500);
    }

    localStorage.removeItem("selectedTool");
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function stopGeneration() {
    window.speechSynthesis.cancel();
    setLoading(false);
  }

  function sortMessages(data) {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      if (dateA && dateB) return dateA - dateB;
      return Number(a.id || 0) - Number(b.id || 0);
    });
  }

  async function loadConversations() {
    try {
      const res = await API.get("chat/conversations/");
      setConversations(res.data);

      if (res.data.length > 0 && !activeConversationId) {
        setActiveConversationId(res.data[0].id);
        loadMessages(res.data[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function loadMessages(id) {
    try {
      const res = await API.get(`chat/history/?conversation_id=${id}`);
      setMessages(sortMessages(res.data));
    } catch (err) {
      console.log(err);
    }
  }

  function selectConversation(id) {
    setActiveConversationId(id);
    loadMessages(id);
  }

  async function createConversation() {
    try {
      const res = await API.post("chat/conversations/create/", {
        title: "New Chat",
        mode: aiMode,
      });

      setActiveConversationId(res.data.id);
      setConversations((old) => [res.data, ...old]);
      setMessages([]);
      setActiveFile(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteConversation(id) {
    if (!window.confirm("Delete this chat?")) return;

    try {
      await API.delete(`chat/conversations/delete/${id}/`);
      setConversations((old) => old.filter((c) => c.id !== id));

      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function clearAllChats() {
    if (!window.confirm("Clear all chats?")) return;

    try {
      await API.delete("chat/clear/");
      setMessages([]);
      setConversations([]);
      setActiveConversationId(null);
      setActiveFile(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFileUpload(input) {
    const file = input?.target?.files ? input.target.files[0] : input;
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setPlusOpen(false);

    try {
      const res = await API.post("uploads/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setActiveFile({
        id: res.data.id,
        filename: res.data.filename,
        file_type: res.data.file_type || "document",
      });

      setMessages((old) => [
        ...old,
        {
          id: Date.now(),
          user_message: `📎 Uploaded: ${res.data.filename}`,
          ai_response:
            res.data.file_type === "image"
              ? "Image uploaded successfully. Ask what you want to know about this image."
              : "File uploaded successfully. Ask questions from this file.",
          temporary: true,
        },
      ]);
    } catch (err) {
      console.log(err);
      alert("Upload failed. Check backend uploads API.");
    }

    if (input?.target) input.target.value = "";
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    if (!message.trim() || loading) return;

    const text = message.trim();

    if (tool === "image") {
      await generateImage(text);
      return;
    }

    if (activeFile) {
      await askFile(text);
      return;
    }

    await sendChat(text);
  }

  async function sendChat(text) {
    const tempId = Date.now();

    setMessages((old) => [
      ...old,
      {
        id: tempId,
        user_message: text,
        ai_response: "Thinking...",
        temporary: true,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const context = messages.slice(-8).map((m) => ({
        user: m.user_message,
        ai: m.ai_response,
      }));

      const aiSettings = JSON.parse(localStorage.getItem("ai_settings")) || {};

      const res = await API.post("chat/send/", {
        message: text,
        conversation_id: activeConversationId,
        mode: aiSettings.style || aiMode,
        tool,
        model: aiSettings.model || model,
        temperature: aiSettings.temperature || 0.7,
        max_tokens: aiSettings.maxTokens || 2500,
        response_speed: aiSettings.responseSpeed || "fast",
        direct_only: directOnly,
        answer_style: directOnly ? "only_answer_no_extra_matter" : "detailed",
        context,
      });

      setActiveConversationId(res.data.conversation_id);

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                ...res.data,
                ai_response: res.data.ai_response || "",
                temporary: false,
              }
            : m
        )
      );

      loadConversations();
    } catch (err) {
      console.log(err);

      const errorMessage =
        err.response?.data?.details ||
        err.response?.data?.error ||
        "AI failed. Check backend terminal error or API key.";

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                ...m,
                ai_response: errorMessage,
                temporary: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function askFile(text) {
    const tempId = Date.now();

    setMessages((old) => [
      ...old,
      {
        id: tempId,
        user_message: `📎 ${activeFile.filename}\n\n${text}`,
        ai_response: "Reading file...",
        temporary: true,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const aiSettings = JSON.parse(localStorage.getItem("ai_settings")) || {};

      const res = await API.post(`uploads/ask/${activeFile.id}/`, {
        question: text,
        mode: aiSettings.style || aiMode,
        model: aiSettings.model || model,
        direct_only: directOnly,
      });

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                id: Date.now() + 1,
                user_message: `📎 ${activeFile.filename}\n\n${text}`,
                ai_response: res.data.answer,
                temporary: false,
              }
            : m
        )
      );
    } catch (err) {
      console.log(err);

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                ...m,
                ai_response: "File AI failed. Check backend/API key.",
                temporary: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateImage(prompt) {
    const tempId = Date.now();

    setMessages((old) => [
      ...old,
      {
        id: tempId,
        user_message: prompt,
        ai_response: "Generating image...",
        image_url: "",
        temporary: true,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("chat/image-generate/", {
        prompt,
        model,
      });

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                id: Date.now() + 1,
                user_message: prompt,
                ai_response: `Generated image for: **${prompt}**`,
                image_url: res.data.image_url,
                temporary: false,
              }
            : m
        )
      );
    } catch (err) {
      console.log(err);

      setMessages((old) =>
        old.map((m) =>
          m.id === tempId
            ? {
                ...m,
                ai_response: "Image generation failed. Try again after some time.",
                temporary: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function regenerateAnswer(id) {
    try {
      setLoading(true);

      const res = await API.post(`chat/regenerate/${id}/`, {
        model,
        mode: aiMode,
        direct_only: directOnly,
      });

      setMessages((old) => old.map((m) => (m.id === id ? res.data : m)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function continueAnswer(id) {
    try {
      setLoading(true);

      const res = await API.post(`chat/continue/${id}/`, {
        model,
        mode: aiMode,
        direct_only: directOnly,
      });

      setMessages((old) => old.map((m) => (m.id === id ? res.data : m)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function editMessage(id, oldText) {
    const newText = prompt("Edit your message:", oldText);
    if (!newText) return;

    try {
      setLoading(true);

      const res = await API.post(`chat/edit/${id}/`, {
        message: newText,
        mode: aiMode,
        model,
        direct_only: directOnly,
      });

      setMessages((old) => old.map((m) => (m.id === id ? res.data : m)));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(id) {
    try {
      await API.delete(`chat/delete/${id}/`);
      setMessages((old) => old.filter((m) => m.id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text || "");
    alert("Copied");
  }

  function exportChat() {
    const text = messages
      .map((m) => `USER:\n${m.user_message}\n\nAI:\n${m.ai_response}\n\n---\n`)
      .join("");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-chat-export.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-generated-image.png";
    a.target = "_blank";
    a.click();
  }

  function speakText(text) {
    if (!text) return;

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[`#*_>-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-IN";
    utterance.rate = 1;

    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome for mic.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setMessage((prev) => (prev ? prev + " " + text : text));
    };

    recognition.start();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renderMarkdown(msg) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <div className="code-block-wrapper">
                <div className="code-block-header">
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
        {msg.ai_response || ""}
      </ReactMarkdown>
    );
  }

  const filteredMessages = messages.filter((m) => {
    const q = searchText.toLowerCase();

    return (
      m.user_message?.toLowerCase().includes(q) ||
      m.ai_response?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="premium-chat-layout">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
        onClearChat={clearAllChats}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main
        className={dragOver ? "premium-chat-main drag-active" : "premium-chat-main"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
        }}
      >
        {activeFile && (
          <div className="active-file-pill">
            <span>📎 {activeFile.filename}</span>
            <button onClick={() => setActiveFile(null)}>×</button>
          </div>
        )}

        <div className="agent-toolbar">
          <input
            placeholder="Search this chat..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="auto">Auto Best</option>
            <option value="groq">Groq Fast</option>
            <option value="gemini">Gemini Smart</option>
            <option value="llama">Llama Advanced</option>
            <option value="mixtral">Mixtral Coding</option>
            <option value="deepseek">DeepSeek Code</option>
          </select>

          <select value={aiMode} onChange={(e) => setAiMode(e.target.value)}>
            <option value="coding">Coding</option>
            <option value="beginner">Beginner</option>
            <option value="debug">Debug</option>
            <option value="fast">Fast</option>
            <option value="interview">Interview</option>
          </select>

          <select value={tool} onChange={(e) => setTool(e.target.value)}>
            <option value="chat">Chat</option>
            <option value="web">Web Search</option>
            <option value="image">Image Generate</option>
          </select>

          <button type="button" onClick={() => setDirectOnly(!directOnly)}>
            {directOnly ? "Only Answer: ON" : "Only Answer: OFF"}
          </button>

          <button type="button" onClick={exportChat}>
            Export
          </button>

          {loading && (
            <button type="button" onClick={stopGeneration}>
              Stop
            </button>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="chat-home">
            <div className="chat-home-center">
              <div className="ai-avatar">🤖</div>
              <h1>What can I help you build?</h1>

              <div className="quick-tools-row">
                {quickTools.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setTool(item[2]);
                      setAiMode(item[3]);
                      setMessage(item[4]);

                      if (item[1] === "File AI") {
                        setTimeout(() => fileInputRef.current?.click(), 300);
                      }
                    }}
                  >
                    <span>{item[0]}</span>
                    {item[1]}
                  </button>
                ))}
              </div>

              <div className="suggestion-grid">
                {promptSuggestions.map((p, index) => (
                  <button key={index} onClick={() => setMessage(p)}>
                    {p}
                  </button>
                ))}
              </div>

              <ChatInput
                message={message}
                setMessage={setMessage}
                handleKeyDown={handleKeyDown}
                sendMessage={sendMessage}
                loading={loading}
                listening={listening}
                startVoiceInput={startVoiceInput}
                plusOpen={plusOpen}
                setPlusOpen={setPlusOpen}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
                setTool={setTool}
                setAiMode={setAiMode}
              />
            </div>
          </div>
        ) : (
          <>
            <section className="messages-section">
              {(searchText ? filteredMessages : messages).map((msg) => (
                <div className="message-wrapper" key={msg.id}>
                  <div className="user-message">
                    <p>{msg.user_message}</p>

                    {!msg.temporary && (
                      <button
                        type="button"
                        className="tiny-action"
                        onClick={() => editMessage(msg.id, msg.user_message)}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="ai-message">
                    <div className="ai-header">
                      <span>🤖 AI Agent</span>

                      <div className="ai-actions">
                        {!msg.temporary && (
                          <>
                            <button onClick={() => regenerateAnswer(msg.id)}>
                              Regenerate
                            </button>
                            <button onClick={() => continueAnswer(msg.id)}>
                              Continue
                            </button>
                            <button onClick={() => copyText(msg.ai_response)}>
                              Copy
                            </button>
                            <button onClick={() => speakText(msg.ai_response)}>
                              Speak
                            </button>
                            <button onClick={() => deleteMessage(msg.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {renderMarkdown(msg)}

                    {msg.image_url && (
                      <div className="generated-image-box">
                        <img src={msg.image_url} alt="AI Generated" />

                        <div className="image-action-row">
                          <a href={msg.image_url} target="_blank" rel="noreferrer">
                            Open Image
                          </a>

                          <button type="button" onClick={() => downloadImage(msg.image_url)}>
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </section>

            <ChatInput
              bottom
              message={message}
              setMessage={setMessage}
              handleKeyDown={handleKeyDown}
              sendMessage={sendMessage}
              loading={loading}
              listening={listening}
              startVoiceInput={startVoiceInput}
              plusOpen={plusOpen}
              setPlusOpen={setPlusOpen}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              setTool={setTool}
              setAiMode={setAiMode}
            />
          </>
        )}
      </main>
    </div>
  );
}

function ChatInput({
  bottom,
  message,
  setMessage,
  handleKeyDown,
  sendMessage,
  loading,
  listening,
  startVoiceInput,
  plusOpen,
  setPlusOpen,
  fileInputRef,
  handleFileUpload,
  setTool,
  setAiMode,
}) {
  function chooseTool(toolName, promptText, modeName = "coding") {
    setTool(toolName);
    setAiMode(modeName);
    setMessage(promptText);
    setPlusOpen(false);
  }

  return (
    <form
      className={bottom ? "chatgpt-input-bar bottom-chat-input" : "chatgpt-input-bar"}
      onSubmit={sendMessage}
    >
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileUpload}
      />

      <div className="plus-wrapper">
        <button
          type="button"
          className="chatgpt-plus-btn"
          onClick={() => setPlusOpen(!plusOpen)}
        >
          +
        </button>

        {plusOpen && (
          <div className="plus-menu">
            <button type="button" onClick={() => fileInputRef.current.click()}>
              📎 Upload File / Image
            </button>

            <button
              type="button"
              onClick={() => chooseTool("chat", "Create full React website", "coding")}
            >
              💻 Generate Code
            </button>

            <button
              type="button"
              onClick={() => chooseTool("web", "Search web about ", "fast")}
            >
              🌐 Web Search
            </button>

            <button
              type="button"
              onClick={() =>
                chooseTool("image", "Create AI image of futuristic robot", "coding")
              }
            >
              🖼 Generate Image
            </button>

            <button
              type="button"
              onClick={() => chooseTool("chat", "Debug this code: ", "debug")}
            >
              🛠 Debug
            </button>

            <button
              type="button"
              onClick={() =>
                chooseTool("chat", "Prepare me for interview on ", "interview")
              }
            >
              🎯 Interview Prep
            </button>
          </div>
        )}
      </div>

      <textarea
        placeholder="Ask anything"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows="1"
      />

      <button type="button" className="chatgpt-mic-btn" onClick={startVoiceInput}>
        {listening ? "🔴" : "🎙️"}
      </button>

      <button type="submit" className="chatgpt-send-btn" disabled={loading}>
        {loading ? "…" : "▶"}
      </button>
    </form>
  );
}

export default Chat;