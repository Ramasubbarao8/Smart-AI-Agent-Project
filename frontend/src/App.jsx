import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import AgentTools from "./pages/AgentTools";
import CodeGenerator from "./pages/CodeGenerator";
import Memory from "./pages/Memory";
import TaskPlanner from "./pages/TaskPlanner";
import AISettings from "./pages/AISettings";
import FileAI from "./pages/FileAI";
import History from "./pages/History";
import Profile from "./pages/Profile";

function isAuthenticated() {
  const token = localStorage.getItem("access");
  return !!token;
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-tools"
          element={
            <ProtectedRoute>
              <AgentTools />
            </ProtectedRoute>
          }
        />

        <Route
          path="/code-generator"
          element={
            <ProtectedRoute>
              <CodeGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file-ai"
          element={
            <ProtectedRoute>
              <FileAI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/memory"
          element={
            <ProtectedRoute>
              <Memory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/task-planner"
          element={
            <ProtectedRoute>
              <TaskPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-settings"
          element={
            <ProtectedRoute>
              <AISettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            isAuthenticated() ? (
              <Navigate to="/chat" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;