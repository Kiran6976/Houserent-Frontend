import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Building2,
  Loader2,
  User,
  Mail,
  Lock,
  MapPin,
  Calendar,
  Phone,
} from "lucide-react";

// Small helper: 6-digit OTP only
const onlyDigits = (v) => v.replace(/\D/g, "").slice(0, 6);

export const Register = () => {
  const { register, verifyEmailOtp, resendOtp } = useAuth(); // ✅ you will add these in AuthContext
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState("form"); // "form" | "otp"

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  const emailLower = useMemo(
    () => (formData.email || "").trim().toLowerCase(),
    [formData.email]
  );

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) newErrors.age = "Age is required";
    else if (age < 18) newErrors.age = "You must be at least 18 years old";

    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        name: formData.name,
        age: parseInt(formData.age),
        address: formData.address,
        email: emailLower,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      });

      if (result?.success) {
        // ✅ Registration now sends OTP, so go to OTP step
        showToast("OTP sent to your email. Please verify.", "success");
        setStep("otp");
        setCooldown(60); // 60s resend cooldown
      } else {
        showToast(result?.message || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const cleaned = onlyDigits(otp);
    if (cleaned.length !== 6) {
      showToast("Enter a valid 6-digit OTP", "error");
      return;
    }

    setOtpLoading(true);
    try {
      const result = await verifyEmailOtp({
        email: emailLower,
        otp: cleaned,
      });

      if (result?.success) {
        showToast("Email verified successfully!", "success");
        // If your backend returns token on verify, AuthContext can store it.
        // Navigate to role-based dashboard or login
        if (result?.user?.role === "landlord") navigate("/landlord");
        else if (result?.user?.role === "admin") navigate("/admin");
        else navigate("/tenant");
      } else {
        showToast(result?.message || "Invalid OTP", "error");
      }
    } catch (err) {
      showToast("Verification failed. Please try again.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResendLoading(true);
    try {
      const result = await resendOtp({ email: emailLower });

      if (result?.success) {
        showToast("OTP sent again.", "success");
        setCooldown(60);
      } else {
        showToast(result?.message || "Failed to resend OTP", "error");
      }
    } catch (err) {
      showToast("Failed to resend OTP. Please try again.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ===========================
  // UI: OTP STEP
  // ===========================
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600"
            >
              <Building2 className="w-10 h-10" />
              <span>HomeRent</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Verify your email
            </h1>
            <p className="mt-2 text-gray-600">
              We sent a 6-digit OTP to{" "}
              <span className="font-medium text-gray-900">{emailLower}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(onlyDigits(e.target.value))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-center tracking-[0.6em] font-semibold"
                  placeholder="••••••"
                />
                <p className="mt-2 text-xs text-gray-500">
                  OTP expires in 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || cooldown > 0}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 disabled:opacity-50"
                >
                  {resendLoading
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already verified?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // UI: FORM STEP
  // ===========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600"
          >
            <Building2 className="w-10 h-10" />
            <span>HomeRent</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">Join us to find or list rentals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: "tenant" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "tenant"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🏠</div>
                  <div className="font-medium">Tenant</div>
                  <div className="text-xs text-gray-500">Looking to rent</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: "landlord" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === "landlord"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🔑</div>
                  <div className="font-medium">Landlord</div>
                  <div className="text-xs text-gray-500">List properties</div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Age & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.age ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                    placeholder="25"
                  />
                </div>
                {errors.age && (
                  <p className="mt-1 text-sm text-red-500">{errors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="123 Main St, City, State"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Demo Credentials</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Landlord:</strong> landlord@demo.com / password123
            </p>
            <p>
              <strong>Tenant:</strong> tenant@demo.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
