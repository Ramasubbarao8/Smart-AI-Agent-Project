import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../api";
import "../styles/PremiumTaskPlanner.css";

function TaskPlanner() {
  const [form, setForm] = useState({
    goal: "",
    category: "project",
    days: "7",
    level: "beginner",
    priority: "high",
  });

  const [plan, setPlan] = useState("");
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const examples = [
    "Complete my AI agent project in 7 days",
    "Prepare for Infosys technical interview",
    "Build React + Django login system",
    "Learn DSA basics for coding exam",
  ];

  useEffect(() => {
    loadSavedPlans();
  }, []);

  async function loadSavedPlans() {
    try {
      const res = await API.get("memory/task-plans/");
      setSavedPlans(res.data);
    } catch (err) {
      console.log("Load plans error:", err);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function generatePlan(e) {
    e.preventDefault();

    if (!form.goal.trim()) {
      alert("Enter your goal");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const aiSettings = JSON.parse(localStorage.getItem("ai_settings")) || {};

      const res = await API.post("memory/task-planner/", {
        ...form,
        model: aiSettings.model || "auto",
        style: aiSettings.style || "beginner",
      });

      setPlan(res.data.plan);
      loadSavedPlans();
    } catch (err) {
      console.log(err);
      setPlan(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Error generating task plan."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyPlan() {
    navigator.clipboard.writeText(plan);
    alert("Copied!");
  }

  function exportPlan() {
    const blob = new Blob([plan], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-task-plan.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  async function deletePlan(id) {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await API.delete(`memory/task-plans/delete/${id}/`);
      setSavedPlans(savedPlans.filter((p) => p.id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  function useExample(text) {
    setForm({
      ...form,
      goal: text,
    });
  }

  return (
    <div className="planner-page">
      <section className="planner-card">
        <div className="planner-header">
          <span>REAL AI TASK PLANNER</span>
          <h1>Plan Your Goal With AI</h1>
          <p>
            Create step-by-step plans like a real AI agent for projects,
            interviews, coding, learning, and daily tasks.
          </p>
        </div>

        <div className="planner-examples">
          {examples.map((item, index) => (
            <button key={index} onClick={() => useExample(item)}>
              {item}
            </button>
          ))}
        </div>

        <form className="planner-form" onSubmit={generatePlan}>
          <textarea
            name="goal"
            placeholder="Example: I want to complete my AI agent project in 7 days..."
            value={form.goal}
            onChange={handleChange}
          />

          <div className="planner-controls">
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="project">Project</option>
              <option value="interview">Interview</option>
              <option value="coding">Coding Practice</option>
              <option value="learning">Learning</option>
              <option value="daily">Daily Routine</option>
            </select>

            <select name="days" value={form.days} onChange={handleChange}>
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
            </select>

            <select name="level" value={form.level} onChange={handleChange}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Planning..." : "Generate AI Plan"}
          </button>
        </form>

        {plan && (
          <div className="planner-result">
            <div className="planner-result-top">
              <h2>AI Plan</h2>

              <div>
                <button onClick={copyPlan}>Copy</button>
                <button onClick={exportPlan}>Export</button>
              </div>
            </div>

            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
          </div>
        )}

        <div className="saved-plans">
          <h2>Saved Plans</h2>

          {savedPlans.length === 0 ? (
            <p className="empty-plans">No saved plans yet.</p>
          ) : (
            savedPlans.map((item) => (
              <div className="saved-plan-card" key={item.id}>
                <div>
                  <h3>{item.goal}</h3>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </div>

                <div className="saved-plan-actions">
                  <button onClick={() => setPlan(item.plan)}>Open</button>
                  <button onClick={() => deletePlan(item.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default TaskPlanner;