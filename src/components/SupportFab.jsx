// src/components/SupportFab.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const SupportFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Optional: hide on admin pages (admin has separate /admin/support)
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;

  // If user not logged in, send them to login first
  const goSupport = () => {
    if (!isAuthenticated) return navigate("/login", { state: { from: "/support" } });
    navigate("/support");
  };

  const label = user?.role === "landlord" ? "Support" : "Support";

  return (
    <button
      type="button"
      onClick={goSupport}
      className="
        fixed bottom-6 right-6 z-50
        inline-flex items-center gap-2
        rounded-full px-4 py-3
        bg-indigo-600 text-white font-semibold
        shadow-2xl shadow-black/20
        hover:bg-indigo-700 active:scale-95
        transition
      "
      aria-label="Open Support"
      title="Support"
    >
      <LifeBuoy className="w-5 h-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};
