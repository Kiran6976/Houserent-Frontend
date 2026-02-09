import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  User,
  Menu,
  X,
  Building2,
  Key,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const AdminLink = () => (
    <Link
      to={isAuthenticated && user?.role === "admin" ? "/admin/dashboard" : "/admin"}
      className="text-gray-700 hover:text-indigo-600 transition"
    >
      Admin
    </Link>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
              <Building2 className="w-8 h-8" />
              <span>HomeRent</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {user?.role === "landlord" ? (
                  <>
                    <Link
                      to="/landlord/dashboard"
                      className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/landlord/add-house"
                      className="text-gray-700 hover:text-indigo-600 transition"
                    >
                      Add House
                    </Link>

                    {/* ✅ NEW: Visit Requests */}
                    <Link
                      to="/landlord/visit-requests"
                      className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Visit Requests
                    </Link>
                  </>
                ) : user?.role === "tenant" ? (
                  <>
                    <Link
                      to="/tenant/houses"
                      className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                    >
                      <Home className="w-4 h-4" />
                      Browse Houses
                    </Link>

                    {/* ✅ My Rents */}
                    <Link
                      to="/tenant/my-rents"
                      className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                    >
                      <Key className="w-4 h-4" />
                      My Rents
                    </Link>

                    {/* ✅ NEW: My Visits */}
                    <Link
                      to="/tenant/my-visits"
                      className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 transition"
                    >
                      <Calendar className="w-4 h-4" />
                      My Visits
                    </Link>
                  </>
                ) : (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                    Admin
                  </Link>
                )}

                {/* Profile + Logout */}
                <div className="flex items-center gap-3 pl-4 border-l">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <AdminLink />
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((s) => !s)}
              className="text-gray-700 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-gray-600 pb-2 border-b">
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>

                {user?.role === "landlord" ? (
                  <>
                    <Link
                      to="/landlord/dashboard"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/landlord/add-house"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      Add House
                    </Link>

                    {/* ✅ NEW: Visit Requests */}
                    <Link
                      to="/landlord/visit-requests"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      Visit Requests
                    </Link>
                  </>
                ) : user?.role === "tenant" ? (
                  <>
                    <Link
                      to="/tenant/houses"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      Browse Houses
                    </Link>

                    {/* ✅ My Rents */}
                    <Link
                      to="/tenant/my-rents"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      My Rents
                    </Link>

                    {/* ✅ NEW: My Visits */}
                    <Link
                      to="/tenant/my-visits"
                      onClick={closeMobile}
                      className="block text-gray-700 hover:text-indigo-600"
                    >
                      My Visits
                    </Link>
                  </>
                ) : (
                  <Link to="/admin/dashboard" onClick={closeMobile} className="block text-gray-700 hover:text-indigo-600">
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobile();
                  }}
                  className="flex items-center gap-1 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <AdminLink />
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="block text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="block text-indigo-600 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
