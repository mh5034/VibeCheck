import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/vibecheck-logo.svg";
import { Button } from "@/components/ui/button";
import { UserRound, LogOut } from "lucide-react";
import { Menu } from "@base-ui/react/menu";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-slate-950 border-b border-purple-400/30 text-white px-4 sm:px-6 py-2 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center sticky top-0 z-10">
      <Link to="/" className="text-xl font-bold text-purple-400">
        <img src={logo} alt="VibeCheck" className="h-10 w-auto" />
      </Link>
      <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
        <button
          onClick={() => navigate("/topics")}
          className="text-gray-300 hover:text-white text-sm"
        >
          Explore
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={() =>
                isLoggedIn ? navigate("/dashboard") : navigate("/auth")
              }
              className="text-gray-300 hover:text-white text-sm"
            >
              My Vibes
            </button>
            <Menu.Root modal={false}>
              <Menu.Trigger
                aria-label="User menu"
                className="flex items-center justify-center rounded-full text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <UserRound size={21} />
              </Menu.Trigger>

              <Menu.Portal>
                <Menu.Positioner align="end" sideOffset={8} className="z-50">
                  <Menu.Popup className="min-w-36 rounded-xl border border-purple-800/60 bg-slate-950 p-1 shadow-lg outline-none">
                    <Menu.Item
                      onClick={handleLogout}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 outline-none data-highlighted:bg-red-400/10"
                    >
                      <LogOut size={16} />
                      Logout
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </>
        ) : (
          <Button
            render={<Link to="/auth" />}
            className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 px-4 py-2 rounded-lg text-sm"
          >
            Log In
          </Button>
        )}
      </div>
    </nav>
  );
}
