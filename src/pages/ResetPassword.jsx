// src/pages/ResetPassword.jsx (FULL UPDATED FILE - adds Resend OTP + cooldown)
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Loader2, Building2, Mail, KeyRound, RotateCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, resendForgotPasswordOtp } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(location?.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [err, setErr] = useState("");

  const passwordOk = useMemo(() => String(password).length >= 6, [password]);

  // ✅ Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const validateEmailOnly = () => {
    const e = String(email || "").trim();
    if (!e) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return "Please enter a valid email";
    return "";
  };

  const validate = () => {
    const eMsg = validateEmailOnly();
    if (eMsg) return eMsg;

    const o = String(otp || "").trim();
    if (!o) return "OTP is required";
    if (!/^\d{6}$/.test(o)) return "OTP must be 6 digits";

    if (!password) return "New password is required";
    if (String(password).length < 6) return "Password must be at least 6 characters";
    if (confirm !== password) return "Passwords do not match";
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
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });

      if (res?.success) {
        showToast(res.message || "Password updated. Please login.", "success");
        navigate("/login");
      } else {
        showToast(res?.message || "Reset failed", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

 // ✅ Resend OTP handler (via AuthContext)
const handleResendOtp = async () => {
  const eMsg = validateEmailOnly();
  if (eMsg) {
    setErr(eMsg);
    return;
  }

  setErr("");
  setResendLoading(true);

  try {
    const res = await resendForgotPasswordOtp(email.trim());

    if (!res.success) {
      showToast(res.message || "Failed to resend OTP", "error");
      return;
    }

    showToast(res.message || "OTP resent to your email.", "success");
    setCooldown(30); // frontend cooldown timer
  } catch (e) {
    showToast("Network error while resending OTP", "error");
  } finally {
    setResendLoading(false);
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
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Reset password</h1>
          <p className="mt-2 text-gray-600">Enter the OTP sent to your email and set a new password.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (err) setErr("");
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    err ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="6-digit OTP"
                />
              </div>

              {/* ✅ Resend OTP row */}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">Didn’t receive OTP?</p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading || cooldown > 0}
                  className={`inline-flex items-center gap-2 text-sm font-medium ${
                    resendLoading || cooldown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:text-indigo-700"
                  }`}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RotateCw className="w-4 h-4" />
                      Resend in {cooldown}s
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4" />
                      Resend OTP
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (err) setErr("");
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    err ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
              </div>
              <p className={`mt-1 text-sm ${passwordOk ? "text-green-600" : "text-gray-500"}`}>
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (err) setErr("");
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    err ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {err && <p className="text-sm text-red-500">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Back to{" "}
              <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
                login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
