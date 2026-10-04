import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AUTH_EXPIRED_EVENT } from "./api/client";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Topic from "./pages/Topic";
import Auth from "./pages/Auth";
import Dashboard from "./pages/DashboardPage";
import Topics from "./pages/TopicsPage";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { X } from "lucide-react";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { sessionExpired, dismissSessionExpired, isLoggedIn, login } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbar = location.pathname === "/auth";
  const [openDemo, setOpenDemo] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState("");

  useEffect(() => {
    const goHome = () => navigate("/", { replace: true });
    window.addEventListener(AUTH_EXPIRED_EVENT, goHome);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, goHome);
  }, [navigate]);

  const handleDemoLogin = async () => {
    if (demoLoading) return;

    setDemoLoading(true);
    setDemoError("");

    try {
      await login("demo@vibecheck.com", "vibecheck");
    } catch {
      setDemoError("Demo login is currently unavailable.");
    } finally {
      setDemoLoading(false);
      navigate("/");
    }
  };

  return (
    <>
      {!hideNavbar && <Navbar />}

      {openDemo && !isLoggedIn && !sessionExpired && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-center gap-3 border-b border-purple-400/30 bg-slate-950 px-4 py-1 text-sm text-gray-300"
        >
          <p>Explore the full experience with our demo account.</p>
          <button
            disabled={demoLoading}
            onClick={handleDemoLogin}
            className="hover:underline"
          >
            {demoLoading ? "Signing in..." : "Try demo"}
          </button>

          <button
            type="button"
            onClick={() => setOpenDemo(false)}
            aria-label="Dismiss demo account message"
            className="rounded px-1 py-1 text-gray-300 hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {sessionExpired && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-center gap-3 border-b border-purple-400/30 bg-slate-950 px-4 py-1 text-sm text-gray-300"
        >
          <p>
            Your session has expired. You can still browse topics and posts
            while logged out.
          </p>
          {!hideNavbar && (
            <Link
              to="/auth"
              className="font-semibold underline underline-offset-4 hover:text-white"
            >
              Log in
            </Link>
          )}
          <button
            type="button"
            onClick={dismissSessionExpired}
            aria-label="Dismiss session expiration message"
            className="rounded px-2 py-1 text-gray-300 hover:bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:id" element={<Topic />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/topics" element={<Topics />} />
      </Routes>
    </>
  );
}
