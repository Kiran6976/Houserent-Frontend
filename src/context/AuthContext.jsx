import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(undefined);

// ✅ Change this if your backend runs on different port/domain
const API_URL = import.meta.env.VITE_API_URL;

// LocalStorage keys
const LS_USER_KEY = "homerent_current_user";
const LS_TOKEN_KEY = "homerent_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session on reload
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LS_USER_KEY);
      const savedToken = localStorage.getItem(LS_TOKEN_KEY);

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      localStorage.removeItem(LS_USER_KEY);
      localStorage.removeItem(LS_TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ small helper to make requests
  const request = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, data, status: res.status };
    }
    return { ok: true, data, status: res.status };
  };

  const saveSession = (newToken, newUser) => {
    localStorage.setItem(LS_TOKEN_KEY, newToken);
    localStorage.setItem(LS_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // ✅ NEW: update only user (useful when landlord updates UPI etc.)
  const updateUser = (newUser) => {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  // ✅ NEW (optional): update only token (if needed later)
  const updateToken = (newToken) => {
    localStorage.setItem(LS_TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const clearSession = () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
    setToken(null);
  };

  // ✅ LOGIN (blocked if email not verified by backend)
  const login = async (email, password) => {
    try {
      const { ok, data, status } = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!ok) {
        return {
          success: false,
          message:
            data?.message ||
            (status === 403 ? "Please verify your email first." : "Login failed"),
          status,
        };
      }

      if (data?.token && data?.user) {
        saveSession(data.token, data.user);
      }

      return { success: true, user: data?.user };
    } catch (err) {
      return {
        success: false,
        message: "Network error. Check backend is running on port 5000.",
      };
    }
  };

  // ✅ REGISTER (now sends OTP, does NOT auto-login)
  const register = async (userData) => {
    try {
      const { ok, data } = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (!ok) {
        return {
          success: false,
          message: data?.message || "Registration failed",
        };
      }

      return {
        success: true,
        message: data?.message || "OTP sent to email. Please verify.",
      };
    } catch (err) {
      return {
        success: false,
        message: "Network error. Check backend is running on port 5000.",
      };
    }
  };

  // ✅ VERIFY EMAIL OTP (backend returns token + user after verify)
  const verifyEmailOtp = async ({ email, otp }) => {
    try {
      const { ok, data } = await request("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (!ok) {
        return {
          success: false,
          message: data?.message || "OTP verification failed",
        };
      }

      if (data?.token && data?.user) {
        saveSession(data.token, data.user);
      }

      return { success: true, user: data?.user, message: data?.message };
    } catch (err) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // ✅ RESEND OTP
  const resendOtp = async ({ email }) => {
    try {
      const { ok, data } = await request("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!ok) {
        return {
          success: false,
          message: data?.message || "Failed to resend OTP",
        };
      }

      return { success: true, message: data?.message || "OTP sent again" };
    } catch (err) {
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // ✅ OPTIONAL: refresh user from /me (useful after reload)
  const fetchMe = async () => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: data?.message || "Failed" };

      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      loading,

      login,
      register,
      verifyEmailOtp,
      resendOtp,
      fetchMe,

      // ✅ NEW exports
      updateUser,
      updateToken,

      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
