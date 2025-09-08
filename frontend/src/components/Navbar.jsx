import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import useAppStore from "../store/useAuthStore";

const Navbar = () => {
  const { token, clearToken, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <nav className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
          Library<span className="text-gray-800 dark:text-gray-200">X</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2  bg-gray-100 rounded-lg dark:bg-gray-800 hover:scale-105  transition"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun color="white" size={18} />}
          </button>

          {token ? (
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
