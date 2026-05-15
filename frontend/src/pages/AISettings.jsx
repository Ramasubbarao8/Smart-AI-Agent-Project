import { useEffect, useState } from "react";
import "../styles/PremiumAISettings.css";

function AISettings() {
  const defaultSettings = {
    model: "auto",
    temperature: 0.7,
    maxTokens: 1200,
    style: "coding",
    responseSpeed: "normal",
    voiceOutput: true,
    saveHistory: true,
    markdown: true,
    codeMode: true,
    imageQuality: "hd",
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ai_settings");

    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });

    setSavedMsg("");
  }

  function saveSettings(e) {
    e.preventDefault();

    localStorage.setItem("ai_settings", JSON.stringify(settings));

    setSavedMsg("AI settings saved successfully!");
  }

  function resetSettings() {
    setSettings(defaultSettings);
    localStorage.setItem("ai_settings", JSON.stringify(defaultSettings));
    setSavedMsg("AI settings reset successfully!");
  }

  return (
    <div className="settings-page">
      <section className="settings-card">
        <div className="settings-header">
          <span>REAL AI AGENT SETTINGS</span>

          <h1>Customize Your AI Workspace</h1>

          <p>
            Control model, answer style, coding behavior, image quality, voice,
            history, and response speed.
          </p>
        </div>

        {savedMsg && <div className="settings-success">{savedMsg}</div>}

        <form className="settings-form" onSubmit={saveSettings}>
          <div className="setting-grid">
            <div className="setting-group">
              <label>AI Model</label>

              <select name="model" value={settings.model} onChange={handleChange}>
                <option value="auto">Auto Best Model</option>
                <option value="groq">Groq Fast</option>
                <option value="gemini">Gemini Smart</option>
                <option value="both">Groq + Gemini</option>
              </select>

              <small>Auto selects the best available AI response.</small>
            </div>

            <div className="setting-group">
              <label>Answer Style</label>

              <select name="style" value={settings.style} onChange={handleChange}>
                <option value="coding">Coding Expert</option>
                <option value="beginner">Beginner Friendly</option>
                <option value="professional">Professional</option>
                <option value="interview">Interview Preparation</option>
                <option value="short">Short Direct Answer</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Temperature: {settings.temperature}</label>

              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={handleChange}
              />

              <small>Low = accurate, High = creative</small>
            </div>

            <div className="setting-group">
              <label>Max Tokens</label>

              <select
                name="maxTokens"
                value={settings.maxTokens}
                onChange={handleChange}
              >
                <option value="500">Short Answer</option>
                <option value="1200">Normal Answer</option>
                <option value="2500">Detailed Answer</option>
                <option value="4000">Long Code / Full Project</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Response Speed</label>

              <select
                name="responseSpeed"
                value={settings.responseSpeed}
                onChange={handleChange}
              >
                <option value="fast">Fast</option>
                <option value="normal">Normal</option>
                <option value="deep">Deep Thinking</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Image Quality</label>

              <select
                name="imageQuality"
                value={settings.imageQuality}
                onChange={handleChange}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>
          </div>

          <div className="toggle-panel">
            <label>
              <input
                type="checkbox"
                name="voiceOutput"
                checked={settings.voiceOutput}
                onChange={handleChange}
              />
              Voice Output
            </label>

            <label>
              <input
                type="checkbox"
                name="saveHistory"
                checked={settings.saveHistory}
                onChange={handleChange}
              />
              Save Chat History
            </label>

            <label>
              <input
                type="checkbox"
                name="markdown"
                checked={settings.markdown}
                onChange={handleChange}
              />
              Markdown Tables
            </label>

            <label>
              <input
                type="checkbox"
                name="codeMode"
                checked={settings.codeMode}
                onChange={handleChange}
              />
              Code Blocks + Copy
            </label>
          </div>

          <div className="settings-actions">
            <button type="submit">Save Settings</button>

            <button type="button" onClick={resetSettings} className="reset-btn">
              Reset
            </button>
          </div>
        </form>

        <div className="settings-status">
          <h2>Current AI Setup</h2>

          <div className="status-grid">
            <div>
              <strong>🤖 {settings.model}</strong>
              <span>Selected Model</span>
            </div>

            <div>
              <strong>🎯 {settings.style}</strong>
              <span>Answer Style</span>
            </div>

            <div>
              <strong>🔥 {settings.temperature}</strong>
              <span>Creativity</span>
            </div>

            <div>
              <strong>🧾 {settings.maxTokens}</strong>
              <span>Max Tokens</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AISettings;