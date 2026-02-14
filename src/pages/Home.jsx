// src/pages/Home.jsx (FULL FIXED + UPGRADED FILE)
// ✅ Fixes:
// - CTABoxPro is now defined (no more "CTABoxPro is not defined")
// - Sections have background gradients/vectors (not plain)
// - Browse Properties section gets animated blobs + dot texture
// - CTA section upgraded with gradient + subtle animations

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const primaryCtaLink = isAuthenticated
    ? user?.role === "landlord"
      ? "/landlord/dashboard"
      : "/tenant/houses"
    : "/tenant/houses";

  const secondaryCtaLink = isAuthenticated
    ? user?.role === "landlord"
      ? "/landlord/add-house"
      : "/tenant/rents"
    : "/register";

  const primaryCtaText = isAuthenticated
    ? user?.role === "landlord"
      ? "Go to Dashboard"
      : "Browse Properties"
    : "Browse Properties";

  const secondaryCtaText = isAuthenticated
    ? user?.role === "landlord"
      ? "List a Property"
      : "My Rents"
    : "Create Account";

  const heroSubtitle =
    isAuthenticated && user?.role === "landlord"
      ? "List verified properties, manage tenants, and track bookings—everything in one dashboard."
      : "Discover verified listings, contact landlords instantly, and book with confidence. Faster decisions, fewer hassles.";

  const [qs, setQs] = useState({
    location: "",
    minRent: "",
    maxRent: "",
    type: "",
    beds: "",
    search: "",
  });

  const [featured, setFeatured] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/houses`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setFeatured(data.slice(0, 12));
      } catch (e) {
        console.log(e);
      }
    };
    loadFeatured();
  }, []);

  const onChangeQS = (e) => {
    const { name, value } = e.target;
    setQs((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (qs.location.trim()) params.set("location", qs.location.trim());
    if (qs.minRent) params.set("minRent", qs.minRent);
    if (qs.maxRent) params.set("maxRent", qs.maxRent);
    if (qs.type) params.set("type", qs.type);
    if (qs.beds) params.set("beds", qs.beds);
    if (qs.search.trim()) params.set("search", qs.search.trim());

    params.set("focus", "grid");
    navigate(`/tenant/houses?${params.toString()}`);
  };

  const locationLabel = useMemo(() => (qs.location?.trim() ? qs.location.trim() : "Anywhere"), [qs.location]);

  const budgetLabel = useMemo(() => {
    const min = qs.minRent ? `₹${Number(qs.minRent).toLocaleString("en-IN")}` : "Any";
    const max = qs.maxRent ? `₹${Number(qs.maxRent).toLocaleString("en-IN")}` : "Any";
    return `${min} – ${max}`;
  }, [qs.minRent, qs.maxRent]);

  const typeLabel = useMemo(() => {
    if (!qs.type) return "Any";
    if (qs.type === "apartment") return "Apartment";
    if (qs.type === "room") return "Room";
    if (qs.type === "house") return "House";
    return qs.type;
  }, [qs.type]);

  const goToBrowse = () => navigate("/tenant/houses?focus=grid");

  const scrollSlider = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const tenantCtaLink = isAuthenticated ? "/tenant/houses" : "/register";
  const landlordCtaLink = isAuthenticated
    ? user?.role === "landlord"
      ? "/landlord/add-house"
      : "/register"
    : "/register";

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
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

              {isAuthenticated && user?.name && (
                <div className="mt-3 text-white/85 text-sm">
                  Welcome back, <span className="font-semibold text-white">{user.name}</span> 👋
                </div>
              )}

              <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Find a rental you’ll
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                  actually love
                </span>
              </h1>

              <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">{heroSubtitle}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={primaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-indigo-700 rounded-2xl font-semibold hover:bg-white/95 transition shadow-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                >
                  <Search className="w-5 h-5" />
                  {primaryCtaText}
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to={secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-white border border-white/25 bg-white/10 hover:bg-white/15 transition backdrop-blur"
                >
                  <Key className="w-5 h-5" />
                  {secondaryCtaText}
                </Link>
              </div>

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

            {/* Right */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleQuickSearch}
                className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl shadow-black/25 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-lg">Quick Search</div>
                  <div className="text-white/70 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {locationLabel}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                    <label className="text-white/70 text-xs">Location</label>
                    <input
                      name="location"
                      value={qs.location}
                      onChange={onChangeQS}
                      placeholder="e.g. Agartala"
                      className="mt-2 w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <label className="text-white/70 text-xs">Min Rent</label>
                      <input
                        type="number"
                        name="minRent"
                        value={qs.minRent}
                        onChange={onChangeQS}
                        placeholder="5000"
                        className="mt-2 w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                      />
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <label className="text-white/70 text-xs">Max Rent</label>
                      <input
                        type="number"
                        name="maxRent"
                        value={qs.maxRent}
                        onChange={onChangeQS}
                        placeholder="20000"
                        className="mt-2 w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                      />
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4 col-span-2">
                      <label className="text-white/70 text-xs">Property Type</label>
                      <select
                        name="type"
                        value={qs.type}
                        onChange={onChangeQS}
                        className="mt-2 w-full bg-transparent text-white outline-none"
                      >
                        <option className="text-gray-900" value="">
                          Any
                        </option>
                        <option className="text-gray-900" value="room">
                          Room
                        </option>
                        <option className="text-gray-900" value="apartment">
                          Apartment
                        </option>
                        <option className="text-gray-900" value="house">
                          House
                        </option>
                      </select>
                      <div className="mt-2 text-xs text-white/60">
                        Budget: <b>{budgetLabel}</b> • Type: <b>{typeLabel}</b>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <label className="text-white/70 text-xs">Beds (min)</label>
                      <input
                        type="number"
                        name="beds"
                        value={qs.beds}
                        onChange={onChangeQS}
                        placeholder="1"
                        className="mt-2 w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                      />
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                      <label className="text-white/70 text-xs">Keyword</label>
                      <input
                        name="search"
                        value={qs.search}
                        onChange={onChangeQS}
                        placeholder="wifi, balcony..."
                        className="mt-2 w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-700 font-semibold hover:bg-white/95 transition"
                  >
                    <Search className="w-5 h-5" />
                    Search Listings
                  </button>

                  <p className="text-xs text-white/60 text-center">
                    Tip: You can also use filters on the listings page.
                  </p>
                </div>
              </form>
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

      {/* FEATURES (with gradients/vectors) */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/60 to-white" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute top-20 -right-28 h-96 w-96 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-fuchsia-200/35 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Why people choose HomeRent
            </div>

            <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-gray-900">
              Everything you need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
                rent smarter
              </span>
            </h2>

            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Clean listings, verified owners, clear pricing, and a booking flow built for real usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCardPro
              icon={<Search className="w-6 h-6" />}
              badge="Search"
              title="Modern search & filters"
              desc="Find the right place fast with filters for location, rent, beds, and property type."
            />
            <FeatureCardPro
              icon={<ShieldCheck className="w-6 h-6" />}
              badge="Trust"
              title="Verified & secure flow"
              desc="Trust signals + a safer booking experience so tenants and landlords both feel confident."
            />
            <FeatureCardPro
              icon={<Star className="w-6 h-6" />}
              badge="Quality"
              title="Premium experience"
              desc="Clean UI, smooth interactions, and dashboards that make it easy to manage everything."
            />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniProof icon={<Clock className="w-5 h-5" />} title="Fast actions" desc="Search + shortlist in seconds" />
            <MiniProof icon={<CheckCircle2 className="w-5 h-5" />} title="Verified owners" desc="More confidence, less risk" />
            <MiniProof icon={<Users className="w-5 h-5" />} title="Tenant-first" desc="Built around real workflows" />
          </div>
        </div>
      </section>

      {/* PROPERTIES SLIDER (with animated blobs) */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/50 to-white" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -top-24 -left-28 h-[420px] w-[420px] rounded-full bg-indigo-300/40 blur-3xl animate-floatSlow" />
        <div className="absolute top-10 -right-36 h-[520px] w-[520px] rounded-full bg-purple-300/40 blur-3xl animate-floatSlow2" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-fuchsia-300/30 blur-3xl animate-floatSlow3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="inline-block rounded-3xl border border-white/60 bg-white/70 backdrop-blur px-6 py-5 shadow-sm">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Browse{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
                  Properties
                </span>
              </h2>
              <p className="mt-2 text-gray-600">
                A quick look at available listings — tap any card to explore more.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => scrollSlider(-1)}
                className="group p-2.5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white shadow-sm transition"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:scale-110 transition" />
              </button>
              <button
                onClick={() => scrollSlider(1)}
                className="group p-2.5 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white shadow-sm transition"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:scale-110 transition" />
              </button>
            </div>
          </div>

          {featured.length > 0 ? (
            <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: "none" }}>
              {featured.map((house) => {
                const image0 =
                  (Array.isArray(house?.images) && house.images[0]) ||
                  "https://via.placeholder.com/400x300?text=No+Image";

                return (
                  <button
                    key={house._id || house.id}
                    onClick={goToBrowse}
                    className="group relative min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] text-left rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

                    <div className="h-44 overflow-hidden">
                      <img
                        src={image0}
                        alt={house?.title || "Property"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-4">
                      <div className="font-semibold text-gray-900 line-clamp-1">{house?.title || "Untitled Property"}</div>
                      <div className="mt-1 text-sm text-gray-500 line-clamp-1">{house?.location || "—"}</div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-indigo-600 font-extrabold">
                          ₹{Number(house?.rent || 0).toLocaleString("en-IN")}
                          <span className="text-gray-500 font-normal text-sm">/mo</span>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {house?.type || "property"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-10 text-center text-gray-600 shadow-sm">
              No properties available right now.
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={goToBrowse}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              Browse All Properties
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes floatSlow {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(18px, 14px) scale(1.04); }
            100% { transform: translate(0,0) scale(1); }
          }
          @keyframes floatSlow2 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(-16px, 12px) scale(1.05); }
            100% { transform: translate(0,0) scale(1); }
          }
          @keyframes floatSlow3 {
            0% { transform: translate(-50%,0) scale(1); }
            50% { transform: translate(calc(-50% + 12px), -10px) scale(1.05); }
            100% { transform: translate(-50%,0) scale(1); }
          }
          .animate-floatSlow { animation: floatSlow 12s ease-in-out infinite; }
          .animate-floatSlow2 { animation: floatSlow2 14s ease-in-out infinite; }
          .animate-floatSlow3 { animation: floatSlow3 16s ease-in-out infinite; }
        `}</style>
      </section>

      {/* CTA (upgraded) */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/60 to-white" />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -top-28 -left-36 h-[520px] w-[520px] rounded-full bg-indigo-300/35 blur-3xl animate-floatCta1" />
        <div className="absolute top-16 -right-44 h-[560px] w-[560px] rounded-full bg-purple-300/35 blur-3xl animate-floatCta2" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-fuchsia-300/25 blur-3xl animate-floatCta3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Made for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
                tenants & landlords
              </span>
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Pick your path—find a place faster as a tenant or list & manage smoothly as a landlord.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {[
                { label: "Verified listings", value: "Trust" },
                { label: "Fast booking", value: "< 1 min" },
                { label: "Direct contact", value: "Instant" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur px-4 py-2 shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CTABoxPro
              variant="tenant"
              title="For Tenants"
              desc="Browse verified listings, compare options, and book without confusion."
              bullets={["Verified property listings", "Direct landlord contact", "Smart filters & quick search"]}
              buttonText={isAuthenticated ? "Browse Properties" : "Create Account"}
              buttonLink={tenantCtaLink}
            />

            <CTABoxPro
              variant="landlord"
              title="For Landlords"
              desc="List your property and manage everything—houses, tenants, and bookings."
              bullets={["Easy property management", "Reach more tenants", "Track bookings & requests"]}
              buttonText={isAuthenticated && user?.role === "landlord" ? "List Your Property" : "Get Started"}
              buttonLink={landlordCtaLink}
            />
          </div>
        </div>

        <style>{`
          @keyframes floatCta1 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(18px, 12px) scale(1.05); }
            100% { transform: translate(0,0) scale(1); }
          }
          @keyframes floatCta2 {
            0% { transform: translate(0,0) scale(1); }
            50% { transform: translate(-16px, 14px) scale(1.06); }
            100% { transform: translate(0,0) scale(1); }
          }
          @keyframes floatCta3 {
            0% { transform: translate(-50%,0) scale(1); }
            50% { transform: translate(calc(-50% + 10px), -10px) scale(1.05); }
            100% { transform: translate(-50%,0) scale(1); }
          }
          .animate-floatCta1 { animation: floatCta1 12s ease-in-out infinite; }
          .animate-floatCta2 { animation: floatCta2 14s ease-in-out infinite; }
          .animate-floatCta3 { animation: floatCta3 16s ease-in-out infinite; }
        `}</style>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-10 md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Building2 className="w-8 h-8" />
                <span>HomeRent</span>
              </div>
              <p className="mt-2 text-white/70 max-w-md">
                A modern rental platform designed for speed, trust, and simplicity.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm text-white/70">
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
                <Link className="block hover:text-white" to="/support">
                  Support
                </Link>
              </div>

              <div className="space-y-2">
                <div className="text-white font-semibold">Legal</div>
                <Link className="block hover:text-white" to="/terms">
                  Terms & Conditions
                </Link>
                <Link className="block hover:text-white" to="/privacy">
                  Privacy Policy
                </Link>
                <Link className="block hover:text-white" to="/refund-policy">
                  Refund & Cancellation
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-white/60 text-sm">
            <span>© {new Date().getFullYear()} HomeRent. All rights reserved.</span>
            <span className="inline-flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              Built with MERN
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCardPro({ icon, badge, title, desc }) {
  return (
    <div className="group relative rounded-3xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-200/35 blur-3xl opacity-0 group-hover:opacity-100 transition" />

      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition shadow-sm">
          {icon}
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
          {badge}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{desc}</p>

      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="mt-4 text-sm text-gray-600 inline-flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          ✓
        </span>
        Smooth UI + reliable flow
      </div>
    </div>
  );
}

function MiniProof({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function CTABoxPro({ variant, title, desc, bullets, buttonText, buttonLink }) {
  const isTenant = variant === "tenant";

  return (
    <div className="group relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-2xl transition overflow-hidden">
      {/* Background accents */}
      <div
        className={`absolute inset-0 opacity-60 ${
          isTenant
            ? "bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.14),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(236,72,153,0.14),transparent_55%)]"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

      <div className="relative p-8">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isTenant ? "bg-indigo-600" : "bg-purple-600"
            }`}
          >
            {isTenant ? "🏠" : "🔑"}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {isTenant ? "Tenant Path" : "Landlord Path"}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{desc}</p>

        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-gray-700">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>

        <Link
          to={buttonLink}
          className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition ${
            isTenant ? "bg-indigo-600 hover:bg-indigo-700" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {buttonText}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
