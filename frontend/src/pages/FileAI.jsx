import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../api";
import "../styles/PremiumFileAI.css";

function FileAI() {
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const res = await API.get("uploads/files/");
      setFiles(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function uploadSelectedFile(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await API.post("uploads/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await loadFiles();

      setSelectedFile({
        id: res.data.id,
        filename: res.data.filename,
        file_type: res.data.file_type,
        uploaded_at: new Date().toISOString(),
      });

      setAnswer(
        `✅ **${res.data.filename}** uploaded successfully.\n\nAsk me anything about this file.`
      );
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function uploadFile(e) {
    uploadSelectedFile(e.target.files[0]);
  }

  async function askAI(e) {
    e.preventDefault();

    if (!selectedFile) {
      alert("Select file first");
      return;
    }

    if (!question.trim()) {
      alert("Enter your question");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const aiSettings = JSON.parse(localStorage.getItem("ai_settings")) || {};

      const res = await API.post(`uploads/ask/${selectedFile.id}/`, {
        question,
        model: aiSettings.model || "auto",
        mode: aiSettings.style || "coding",
      });

      setAnswer(res.data.answer);
    } catch (err) {
      console.log(err);
      setAnswer(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "AI failed to answer. Check backend/API key."
      );
    } finally {
      setLoading(false);
    }
  }

  async function summarizeFile() {
    if (!selectedFile) {
      alert("Select file first");
      return;
    }

    setQuestion("Summarize this file in simple points");
    setLoading(true);
    setAnswer("");

    try {
      const res = await API.post(`uploads/ask/${selectedFile.id}/`, {
        question: "Summarize this file in simple points with key highlights.",
      });

      setAnswer(res.data.answer);
    } catch (err) {
      console.log(err);
      setAnswer("Summary failed.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile(id) {
    if (!window.confirm("Delete file?")) return;

    try {
      await API.delete(`uploads/delete/${id}/`);

      await loadFiles();

      if (selectedFile?.id === id) {
        setSelectedFile(null);
        setAnswer("");
        setQuestion("");
      }
    } catch (err) {
      console.log(err);
    }
  }

  function copyAnswer() {
    navigator.clipboard.writeText(answer || "");
    alert("Copied!");
  }

  function fileName(file) {
    return file.filename || file.file?.split("/").pop() || "Uploaded File";
  }

  function fileIcon(file) {
    const name = fileName(file).toLowerCase();

    if (name.endsWith(".pdf")) return "📕";
    if (name.endsWith(".docx")) return "📘";
    if (name.endsWith(".txt")) return "📄";
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) return "🖼️";

    return "📎";
  }

  return (
    <div
      className={dragOver ? "fileai-page fileai-drag" : "fileai-page"}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);

        if (e.dataTransfer.files[0]) {
          uploadSelectedFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <section className="fileai-header">
        <span>REAL AI FILE AGENT</span>
        <h1>Chat With Your Files</h1>
        <p>
          Upload PDF, DOCX, TXT, JPG, PNG, WEBP and ask questions like ChatGPT.
        </p>
      </section>

      <section className="fileai-layout">
        <aside className="fileai-sidebar">
          <label className="upload-box">
            <input
              ref={fileInputRef}
              type="file"
              onChange={uploadFile}
              hidden
              accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
            />

            <strong>{uploading ? "Uploading..." : "＋ Upload File"}</strong>
            <small>PDF, DOCX, TXT, Image</small>
          </label>

          <div className="file-list">
            {files.length === 0 ? (
              <p className="empty-files">No files uploaded yet</p>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className={
                    selectedFile?.id === file.id
                      ? "file-card active-file"
                      : "file-card"
                  }
                >
                  <button
                    type="button"
                    className="file-select-btn"
                    onClick={() => {
                      setSelectedFile(file);
                      setAnswer("");
                    }}
                  >
                    <span>{fileIcon(file)}</span>

                    <div>
                      <h3>{fileName(file)}</h3>
                      <small>
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleString()
                          : "Uploaded"}
                      </small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="delete-file-btn"
                    onClick={() => deleteFile(file.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="fileai-main">
          {!selectedFile ? (
            <div className="select-file-box">
              <div className="select-icon">📎</div>
              <h2>Select or upload a file</h2>
              <p>Then ask questions, summarize, or explain content using AI.</p>
            </div>
          ) : (
            <>
              <div className="selected-file-info">
                <div>
                  <span>{fileIcon(selectedFile)}</span>
                  <h2>{fileName(selectedFile)}</h2>
                  <p>
                    Ask questions, summarize, extract points, or explain this file.
                  </p>
                </div>

                <button type="button" onClick={summarizeFile}>
                  Summarize
                </button>
              </div>

              <form className="ask-form" onSubmit={askAI}>
                <textarea
                  placeholder="Ask question about this file..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Thinking..." : "Ask File AI"}
                </button>
              </form>

              {answer && (
                <div className="ai-answer">
                  <div className="answer-top">
                    <h2>AI Answer</h2>

                    <button type="button" onClick={copyAnswer}>
                      Copy
                    </button>
                  </div>

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}
        </main>
      </section>
    </div>
  );
}

export default FileAI;