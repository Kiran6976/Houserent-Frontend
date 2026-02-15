import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Building2,
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailLower = useMemo(() => String(email || "").trim().toLowerCase(), [email]);

  const validate = () => {
    const newErrors = {};
    if (!emailLower) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) newErrors.email = "Please enter a valid email";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(emailLower, password);

      if (result?.success) {
        showToast("Login successful!", "success");

        const userData = localStorage.getItem("homerent_current_user");
        if (userData) {
          const user = JSON.parse(userData);
          navigate(user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/houses");
        } else {
          navigate("/");
        }
      } else {
        showToast(result?.message || "Login failed", "error");
      }
    } catch (err) {
      showToast("Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Soft glow blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* LEFT: Brand panel (hidden on small screens) */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-10 text-white shadow-2xl shadow-indigo-200/40">
              <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold">
                  <Building2 className="w-10 h-10" />
                  <span>HomeRent</span>
                </Link>

                <h2 className="mt-10 text-4xl font-extrabold tracking-tight leading-tight">
                  Rent smarter.
                  <br />
                  Live better.
                </h2>

                <p className="mt-4 text-white/85 max-w-md">
                  Manage rentals, verify landlords, and accept visit requests — all in one modern platform.
                </p>

                <div className="mt-8 grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3 backdrop-blur">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold">Verified listings & landlord checks</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3 backdrop-blur">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold">Secure booking payments via UPI</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3 backdrop-blur">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-semibold">Clean dashboard experience</span>
                  </div>
                </div>

                <div className="mt-10 text-xs text-white/70">
                  Tip: Use your registered email and password to access landlord/tenant dashboards.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Login card */}
          <div className="w-full">
            {/* Small header (mobile) */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-indigo-700">
                <Building2 className="w-10 h-10" />
                <span>HomeRent</span>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-100/40">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />

              <div className="p-7 sm:p-9">
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent">
                      Welcome back
                    </span>
                  </h1>
                  <p className="mt-2 text-slate-600">Sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Mail className="w-4.5 h-4.5 text-indigo-700" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full pl-14 pr-4 py-3 rounded-2xl border bg-white outline-none transition
                          ${errors.email ? "border-rose-400" : "border-slate-200"}
                          focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300`}
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Lock className="w-4.5 h-4.5 text-indigo-700" />
                      </div>

                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        className={`w-full pl-14 pr-4 py-3 rounded-2xl border bg-white outline-none transition
                          ${errors.password ? "border-rose-400" : "border-slate-200"}
                          focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300`}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {errors.password ? (
                        <p className="text-sm text-rose-600">{errors.password}</p>
                      ) : (
                        <span />
                      )}

                      <Link to="/forgot-password" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full py-3.5 rounded-2xl font-semibold text-white transition
                               bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600
                               hover:brightness-110 shadow-lg shadow-indigo-200
                               disabled:opacity-60 disabled:hover:brightness-100
                               flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4.5 h-4.5 opacity-90 group-hover:translate-x-0.5 transition" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-500">
                    🔒 Your data is protected with secure authentication.
                  </div>
                </form>

                <p className="mt-7 text-center text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="font-semibold text-indigo-700 hover:text-indigo-800">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Small footer */}
            <div className="mt-6 text-center text-xs text-slate-500">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-indigo-700 font-semibold hover:text-indigo-800">
                Terms
              </Link>{" "}
              &{" "}
              <Link to="/privacy" className="text-indigo-700 font-semibold hover:text-indigo-800">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
