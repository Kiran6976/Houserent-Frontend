import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const v = String(email || "").trim();
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eMsg = validate();
    if (eMsg) {
      setErr(eMsg);
      return;
    }

    setErr("");
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        showToast(res.message || "OTP sent (if account exists).", "success");
        // ✅ Move user to reset page and carry email
        navigate("/reset-password", { state: { email: email.trim() } });
      } else {
        showToast(res.message || "Failed to send OTP", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <Building2 className="w-10 h-10" />
            <span>HomeRent</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-2 text-gray-600">We’ll send a reset OTP to your email.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (err) setErr("");
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    err ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="john@example.com"
                />
              </div>
              {err && <p className="mt-1 text-sm text-red-500">{err}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send OTP"
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Remembered your password?{" "}
              <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
