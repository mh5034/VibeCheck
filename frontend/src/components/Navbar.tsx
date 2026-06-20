import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-purple-400">
        VibeCheck ✨
      </Link>
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/auth"
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
