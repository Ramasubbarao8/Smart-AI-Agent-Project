import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import API from "../api";
import "../styles/PremiumCodeGenerator.css";

function CodeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("react");
  const [codeType, setCodeType] = useState("full_project");
  const [model, setModel] = useState("auto");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const examples = [
    "Create React login page with premium CSS",
    "Create Django REST API for students CRUD",
    "Fix React Router protected route error",
    "Create full React + Django authentication project",
    "Generate Python DSA questions with answers",
    "Create admin dashboard with charts and pagination",
  ];

  async function generateCode(e) {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Please enter what code you want");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const aiSettings = JSON.parse(localStorage.getItem("ai_settings")) || {};

      const res = await API.post("chat/code-generator/", {
        prompt,
        language,
        code_type: codeType,
        model: aiSettings.model || model,
        style: aiSettings.style || "coding",
        max_tokens: aiSettings.maxTokens || 2500,
      });

      setResult(res.data.generated_code);
    } catch (err) {
      console.log(err);
      setResult(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Error generating code. Check backend or API keys."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(result);
    alert("Copied!");
  }

  function clearAll() {
    setPrompt("");
    setResult("");
  }

  return (
    <div className="codegen-page">
      <section className="codegen-card">
        <div className="codegen-header">
          <span>REAL AI CODE AGENT</span>
          <h1>Generate Production Code</h1>
          <p>
            Build React, Django, Python, SQL, APIs, dashboards, and full-stack
            projects with file names and step-by-step setup.
          </p>
        </div>

        <div className="codegen-examples">
          {examples.map((item, index) => (
            <button key={index} onClick={() => setPrompt(item)}>
              {item}
            </button>
          ))}
        </div>

        <form className="codegen-form" onSubmit={generateCode}>
          <div className="codegen-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="react">React</option>
              <option value="django">Django</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="sql">SQL</option>
              <option value="fullstack">React + Django</option>
            </select>

            <select value={codeType} onChange={(e) => setCodeType(e.target.value)}>
              <option value="full_project">Full Project</option>
              <option value="component">Component</option>
              <option value="api">Backend API</option>
              <option value="debug">Debug / Fix</option>
              <option value="explain">Explain Code</option>
            </select>

            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="auto">Auto</option>
              <option value="groq">Groq</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <textarea
            placeholder="Example: Create full React + Django login system with JWT, protected routes, premium UI, and backend urls..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="codegen-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Code"}
            </button>

            <button type="button" className="clear-code-btn" onClick={clearAll}>
              Clear
            </button>
          </div>
        </form>

        {result && (
          <div className="codegen-result">
            <div className="result-top">
              <h2>Generated Output</h2>

              <button onClick={copyCode}>Copy All</button>
            </div>

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");

                  return !inline && match ? (
                    <div className="codegen-code-block">
                      <div className="codegen-code-top">
                        <span>{match[1]}</span>
                        <button onClick={() => navigator.clipboard.writeText(String(children))}>
                          Copy
                        </button>
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
              {result}
            </ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  );
}

export default CodeGenerator;