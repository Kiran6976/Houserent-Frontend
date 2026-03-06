import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Loader2,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export const AdminLogin = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        const userData = localStorage.getItem('homerent_current_user');
        const user = userData ? JSON.parse(userData) : null;
        if (user && user.role === 'admin') {
          showToast('Welcome, Admin!', 'success');
          navigate('/admin/dashboard');
        } else {
          showToast('Access denied. Not an admin account.', 'error');
        }
      } else {
        showToast(result.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center py-12 px-4">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white">
            <Building2 className="w-9 h-9 text-indigo-400" />
            <span>HomeRent</span>
          </Link>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-black/40">
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 mb-4">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Admin Portal
              </h1>
              <p className="mt-2 text-slate-400 text-sm">
                Restricted access — authorized personnel only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-14 pr-4 py-3 rounded-2xl border bg-white/5 text-white placeholder-slate-500 outline-none transition
                      ${errors.email ? 'border-rose-500/70' : 'border-white/10'}
                      focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50`}
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full pl-14 pr-12 py-3 rounded-2xl border bg-white/5 text-white placeholder-slate-500 outline-none transition
                      ${errors.password ? 'border-rose-500/70' : 'border-white/10'}
                      focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-indigo-400 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-rose-400">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 rounded-2xl font-semibold text-white transition
                           bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600
                           hover:brightness-110 shadow-lg shadow-indigo-900/50
                           disabled:opacity-60 disabled:hover:brightness-100
                           flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-0.5 transition" />
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-400">
                All admin activity is monitored and logged for security purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Not an admin?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Go to user login
          </Link>
        </p>
      </div>
    </div>
  );
};
