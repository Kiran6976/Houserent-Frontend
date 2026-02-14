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

// Aadhaar helper (12 digits)
const onlyAadhaarDigits = (v) => v.replace(/\D/g, "").slice(0, 12);

export const Register = () => {
  const { register, verifyEmailOtp, resendOtp } = useAuth();
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
    aadhaarNumber: "", // ✅ NEW
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Terms & Privacy opt-in
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [legalError, setLegalError] = useState("");

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

    // ✅ Aadhaar required ONLY for landlord
    if (formData.role === "landlord") {
      const a = onlyAadhaarDigits(formData.aadhaarNumber);
      if (!a || a.length !== 12) newErrors.aadhaarNumber = "Aadhaar must be 12 digits";
    }

    // ✅ Legal check
    if (!acceptedLegal) {
      setLegalError(
        "You must accept the Terms & Conditions and Privacy Policy to continue"
      );
    } else {
      setLegalError("");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && acceptedLegal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        age: parseInt(formData.age),
        address: formData.address,
        email: emailLower,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      };

      // ✅ send Aadhaar ONLY for landlord
      if (formData.role === "landlord") {
        payload.aadhaarNumber = onlyAadhaarDigits(formData.aadhaarNumber);
      }

      const result = await register(payload);

      if (result?.success) {
        showToast("OTP sent to your email. Please verify.", "success");
        setStep("otp");
        setCooldown(60);
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

        const role = result?.user?.role;

        if (role === "admin") {
          navigate("/admin/dashboard");
          return;
        }

        if (role === "landlord") {
          const isVerified =
            result?.user?.isVerifiedLandlord ||
            result?.user?.verifiedLandlord ||
            result?.user?.isVerified ||
            result?.user?.verified;

          navigate(isVerified ? "/landlord/dashboard" : "/landlord/payment");
          return;
        }

        navigate("/");
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

    // ✅ Aadhaar input: digits only
    if (name === "aadhaarNumber") {
      setFormData((prev) => ({ ...prev, aadhaarNumber: onlyAadhaarDigits(value) }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
      return;
    }

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
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "tenant", aadhaarNumber: "" }))
                  }
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
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "landlord" }))
                  }
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

            {/* ✅ Aadhaar (Landlord only) */}
            {formData.role === "landlord" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  inputMode="numeric"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.aadhaarNumber ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="12-digit Aadhaar"
                />
                {errors.aadhaarNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.aadhaarNumber}</p>
                )}
                
              </div>
            )}

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

            {/* ✅ Terms + Privacy */}
            <div className="flex items-start gap-3">
              <input
                id="legal"
                type="checkbox"
                checked={acceptedLegal}
                onChange={(e) => {
                  setAcceptedLegal(e.target.checked);
                  if (e.target.checked) setLegalError("");
                }}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="legal" className="text-sm text-gray-700">
                I agree to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                and acknowledge that I have read and understood them.
              </label>
            </div>
            {legalError && <p className="text-sm text-red-500">{legalError}</p>}

            <button
              type="submit"
              disabled={loading || !acceptedLegal}
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
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
