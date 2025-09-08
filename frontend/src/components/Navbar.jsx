import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { useEffect } from "react";
import { useState } from "react";

const Navbar = () => {
  const { token, user, clearToken, theme, toggleTheme } = useAuthStore();
  const [loguser ,setLogUser] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  useEffect( () => {
    console.log(user)
    setLogUser(user)
    
  })

  return (
    <nav className="backdrop-blur-md bg-gray-200 dark:bg-gray-900 shadow-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        <Link
          to="/"
          className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
        >
          Library<span className="text-gray-800 dark:text-gray-200">X</span>
        </Link>


        <div className="flex items-center gap-5">
          {/* Show user name if logged in */}
            <Link
          to="/"
          className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <span className="text-gray-800 dark:text-gray-200">H</span>ome
        </Link>
          <Link
          to="/about"
          className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <span className="text-gray-800 dark:text-gray-200">A</span>bout
        </Link>

        {token ? (    <Link
          to="/dashboard"
          className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <span className="text-gray-800 dark:text-gray-200">D</span>ashboard
        </Link>): ""}
        
          {token && user && (
            <span className="text-gray-800 dark:text-gray-300 font-medium">
            
              Welcome, {user}
            </span>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800 hover:scale-105 transition"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun color="white" size={18} />}
          </button>

          {/* Login / Logout button */}
          {token ? (<>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition"
            >
              Logout
            </button>

            
            
         </> ) : (<>
         
            <Link
              to="/login"
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              Register
            </Link>

            </>
            
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
