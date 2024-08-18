import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, PlusSquare, Settings } from "lucide-react";

const BottomTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav bg-gray-800 text-white p-4 flex justify-around items-center">
      <Link
        to="/"
        className={`text-2xl ${location.pathname === "/" ? "text-blue-400" : ""}`}
      >
        <HomeIcon size={24} />
        <span className="text-xs block mt-1">Dashboard</span>
      </Link>
      <Link
        to="/add-correspondence"
        className={`text-2xl ${location.pathname === "/add-correspondence" ? "text-blue-400" : ""}`}
      >
        <PlusSquare size={24} />
        <span className="text-xs block mt-1">Add</span>
      </Link>
      <Link
        to="/settings"
        className={`text-2xl ${location.pathname === "/settings" ? "text-blue-400" : ""}`}
      >
        <Settings size={24} />
        <span className="text-xs block mt-1">Settings</span>
      </Link>
    </nav>
  );
};

export default BottomTabBar;