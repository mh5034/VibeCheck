import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/vibecheck-logo.svg";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <Link to="/" className="text-xl font-bold text-purple-400">
        <img src={logo} alt="VibeCheck" className="h-10 w-auto" />
      </Link>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => navigate("/topics")}
          className="text-gray-300 hover:text-white text-sm"
        >
          Topics
        </button>
        <button
          onClick={() =>
            isLoggedIn ? navigate("/dashboard") : navigate("/auth")
          }
          className="text-gray-300 hover:text-white text-sm"
        >
          My Vibes
        </button>

        {isLoggedIn ? (
          <div className="flex gap-3 items-center">
            <Button
              onClick={handleLogout}
              className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white active:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all duration-200"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            render={<Link to="/auth" />}
            className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-4 py-2 rounded-lg text-sm"
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
