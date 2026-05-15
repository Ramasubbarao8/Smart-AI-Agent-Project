import { useEffect, useState } from "react";
import API from "../api";
import "../styles/PremiumMemory.css";

function Memory() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    tag: "general",
  });

  const tags = ["general", "project", "coding", "interview", "important", "idea"];

  async function loadNotes() {
    try {
      setLoading(true);
      const res = await API.get("memory/notes/");
      setNotes(res.data);
    } catch (err) {
      console.log("Memory error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveMemory(e) {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      alert("Please fill title and content");
      return;
    }

    try {
      if (editingId) {
        await API.put(`memory/update/${editingId}/`, form);
      } else {
        await API.post("memory/notes/", form);
      }

      setForm({ title: "", content: "", tag: "general" });
      setEditingId(null);
      loadNotes();
    } catch (err) {
      console.log(err);
      alert("Failed to save memory");
    }
  }

  function editMemory(note) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      content: note.content,
      tag: note.tag,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ title: "", content: "", tag: "general" });
  }

  async function deleteMemory(id) {
    if (!window.confirm("Delete this memory?")) return;

    try {
      await API.delete(`memory/delete/${id}/`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  function copyMemory(note) {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    alert("Copied!");
  }

  function exportMemories() {
    const text = notes
      .map(
        (note, index) =>
          `MEMORY #${index + 1}\nTitle: ${note.title}\nTag: ${note.tag}\nContent:\n${note.content}\nDate: ${note.created_at}\n\n---\n`
      )
      .join("");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-agent-memory.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function sendToChat(note) {
    localStorage.setItem(
      "memoryPrompt",
      `Use this memory note:\nTitle: ${note.title}\nContent: ${note.content}`
    );

    window.location.href = "/chat";
  }

  const filteredNotes = notes.filter((note) => {
    const text = `${note.title} ${note.content} ${note.tag}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesTag = filterTag === "all" || note.tag === filterTag;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="memory-page">
      <section className="memory-header">
        <span>REAL AI MEMORY</span>
        <h1>Agent Memory Notes</h1>
        <p>
          Save project ideas, coding notes, interview points, bugs, and important
          context for your AI workspace.
        </p>
      </section>

      <section className="memory-toolbar">
        <input
          type="text"
          placeholder="Search memory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
          <option value="all">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <button onClick={exportMemories}>Export</button>
      </section>

      <section className="memory-layout">
        <form className="memory-form" onSubmit={saveMemory}>
          <h2>{editingId ? "Update Memory" : "Add Memory"}</h2>

          <input
            type="text"
            name="title"
            placeholder="Memory title"
            value={form.title}
            onChange={handleChange}
          />

          <textarea
            name="content"
            placeholder="Write memory content..."
            value={form.content}
            onChange={handleChange}
          />

          <select name="tag" value={form.tag} onChange={handleChange}>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <div className="memory-form-actions">
            <button type="submit">
              {editingId ? "Update Memory" : "Save Memory"}
            </button>

            {editingId && (
              <button type="button" className="cancel-memory-btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="memory-list">
          {loading ? (
            <div className="memory-empty">
              <h2>Loading memories...</h2>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="memory-empty">
              <div>🧠</div>
              <h2>No memories found</h2>
              <p>Add your first AI memory note.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div className="memory-card" key={note.id}>
                <div className="memory-card-top">
                  <span>{note.tag}</span>

                  <div>
                    <button onClick={() => copyMemory(note)}>Copy</button>
                    <button onClick={() => editMemory(note)}>Edit</button>
                    <button onClick={() => sendToChat(note)}>Use</button>
                    <button
                      className="delete-memory-btn"
                      onClick={() => deleteMemory(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <h3>{note.title}</h3>

                <p>{note.content}</p>

                <small>
                  {note.created_at
                    ? new Date(note.created_at).toLocaleString()
                    : "Saved"}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Memory;