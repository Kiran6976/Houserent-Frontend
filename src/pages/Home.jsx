import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Search,
  Key,
  ShieldCheck,
  Star,
  ArrowRight,
  MapPin,
  Sparkles,
  BadgeCheck,
  Users,
  Home as HomeIcon,
} from "lucide-react";

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const primaryCtaLink = isAuthenticated
    ? user?.role === "landlord"
      ? "/landlord/dashboard"
      : "/tenant/houses"
    : "/tenant/houses";

  const secondaryCtaLink = isAuthenticated
    ? user?.role === "landlord"
      ? "/landlord/add-house"
      : "/register"
    : "/register";

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_20%,white,transparent_45%),radial-gradient(circle_at_50%_80%,white,transparent_50%)]" />
          <div className="absolute -top-20 -right-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm">
                <Sparkles className="w-4 h-4" />
                Smart & secure rental platform
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Find a rental you’ll
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                  actually love
                </span>
              </h1>

              <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">
                Discover verified listings, contact landlords instantly, and book with confidence. Faster decisions, fewer hassles.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={primaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-indigo-700 rounded-2xl font-semibold hover:bg-white/95 transition shadow-xl shadow-black/20"
                >
                  <Search className="w-5 h-5" />
                  {isAuthenticated ? "Go to Dashboard" : "Browse Properties"}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to={secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-white border border-white/25 bg-white/10 hover:bg-white/15 transition backdrop-blur"
                >
                  <Key className="w-5 h-5" />
                  {user?.role === "landlord" ? "List a Property" : "Create Account"}
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-white/85">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <BadgeCheck className="w-4 h-4" />
                  Verified listings
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <ShieldCheck className="w-4 h-4" />
                  Secure booking flow
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15">
                  <Users className="w-4 h-4" />
                  Built for tenants & landlords
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl shadow-black/25 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-lg">Quick Search</div>
                  <div className="text-white/70 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Anywhere
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                    <div className="text-white/70 text-xs">Location</div>
                    <div className="text-white font-medium">Agartala, IN</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <div className="text-white/70 text-xs">Budget</div>
                      <div className="text-white font-medium">₹5k – ₹20k</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <div className="text-white/70 text-xs">Type</div>
                      <div className="text-white font-medium">Room / Flat</div>
                    </div>
                  </div>

                  <Link
                    to="/tenant/houses"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-700 font-semibold hover:bg-white/95 transition"
                  >
                    <Search className="w-5 h-5" />
                    Search Listings
                  </Link>

                  <p className="text-xs text-white/60 text-center">
                    Tip: Use filters to narrow down quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Verified Listings", value: "100+" },
              { label: "Fast Booking", value: "< 1 min" },
              { label: "Direct Contact", value: "Instant" },
              { label: "Trusted Users", value: "Growing" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-5 py-4 text-white"
              >
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-white/75 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need to rent smarter</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Clean listings, verified owners, clear pricing, and a booking flow built for real usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Modern search & filters"
              desc="Find the right place fast with filters for location, rent, beds, and property type."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Verified & secure flow"
              desc="Better trust signals and a safer booking process so tenants and landlords both feel confident."
            />
            <FeatureCard
              icon={<Star className="w-6 h-6" />}
              title="Premium experience"
              desc="Clean UI, smooth interactions, and dashboards that make it easy to manage everything."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CTABox
              emoji="🏠"
              title="For Tenants"
              desc="Browse verified listings and book without confusion. Contact landlords directly and save time."
              bullets={[
                "Verified property listings",
                "Direct landlord contact",
                "Advanced search filters",
              ]}
              buttonText="Browse Properties"
              buttonLink="/tenant/houses"
              buttonClass="bg-indigo-600 hover:bg-indigo-700"
            />

            <CTABox
              emoji="🔑"
              title="For Landlords"
              desc="List your property and manage everything from your dashboard—houses, tenants, and bookings."
              bullets={[
                "Easy property management",
                "Reach more tenants",
                "Free to list properties",
              ]}
              buttonText="List Your Property"
              buttonLink="/register"
              buttonClass="bg-purple-600 hover:bg-purple-700"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Building2 className="w-8 h-8" />
                <span>HomeRent</span>
              </div>
              <p className="mt-2 text-white/70 max-w-md">
                A modern rental platform designed for speed, trust, and simplicity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm text-white/70">
              <div className="space-y-2">
                <div className="text-white font-semibold">Explore</div>
                <Link className="block hover:text-white" to="/tenant/houses">
                  Properties
                </Link>
                <Link className="block hover:text-white" to="/register">
                  Register
                </Link>
              </div>
              <div className="space-y-2">
                <div className="text-white font-semibold">Account</div>
                <Link className="block hover:text-white" to={primaryCtaLink}>
                  Dashboard
                </Link>
                <span className="block text-white/50">Support: coming soon</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-white/60 text-sm">
            <span>© {new Date().getFullYear()} HomeRent. All rights reserved.</span>
            <span className="inline-flex items-center gap-2">
              <HomeIcon className="w-4 h-4" /> Built with MERN
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group rounded-3xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-xl transition">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{desc}</p>
      <div className="mt-5 h-px bg-gray-100" />
      <div className="mt-4 text-sm text-gray-500 inline-flex items-center gap-2">
        <BadgeCheck className="w-4 h-4 text-green-600" />
        Smooth UI + reliable flow
      </div>
    </div>
  );
}

function CTABox({ emoji, title, desc, bullets, buttonText, buttonLink, buttonClass }) {
  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition overflow-hidden">
      <div className="p-8">
        <div className="text-5xl">{emoji}</div>
        <h3 className="mt-4 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600">{desc}</p>

        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-gray-700">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        <Link
          to={buttonLink}
          className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition ${buttonClass}`}
        >
          {buttonText}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
    </div>
  );
}
