import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HouseCard } from "../components/HouseCard";
import { Search, SlidersHorizontal, X, Loader2, Home } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const TenantHouses = () => {
  const location = useLocation();
  const gridRef = useRef(null);

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    location: "",
    minRent: "",
    maxRent: "",
    type: "",
    beds: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const loadHouses = async (opts = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      const locationV = (opts.location ?? filters.location).trim();
      const typeV = (opts.type ?? filters.type).trim();
      const bedsV = (opts.beds ?? filters.beds).trim();
      const minRentV = (opts.minRent ?? filters.minRent).trim();
      const maxRentV = (opts.maxRent ?? filters.maxRent).trim();
      const searchV = (opts.search ?? searchQuery).trim();

      if (locationV) params.set("location", locationV);
      if (typeV) params.set("type", typeV);
      if (bedsV) params.set("beds", bedsV);
      if (minRentV) params.set("minRent", minRentV);
      if (maxRentV) params.set("maxRent", maxRentV);
      if (searchV) params.set("search", searchV);

      const url = `${API_URL}/api/houses?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load houses");

      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply query params (coming from Home quick search or slider)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const nextFilters = {
      location: params.get("location") || "",
      minRent: params.get("minRent") || "",
      maxRent: params.get("maxRent") || "",
      type: params.get("type") || "",
      beds: params.get("beds") || "",
    };

    const nextSearch = params.get("search") || "";

    setFilters(nextFilters);
    setSearchQuery(nextSearch);

    loadHouses({ ...nextFilters, search: nextSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ✅ Auto-scroll to grid when coming from Home slider
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focus = params.get("focus");

    if (!loading && focus === "grid") {
      setTimeout(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [location.search, loading]);

  const applyFilters = async () => {
    setShowFilters(false);
    await loadHouses();
  };

  const clearFilters = async () => {
    const reset = { location: "", minRent: "", maxRent: "", type: "", beds: "" };
    setFilters(reset);
    setSearchQuery("");
    setShowFilters(false);
    await loadHouses({ ...reset, search: "" });
  };

  // Safety fallback (backend already filters)
  const filteredHouses = useMemo(() => {
    if (!searchQuery.trim()) return houses;

    const q = searchQuery.toLowerCase();
    return houses.filter((house) => {
      const title = (house.title || "").toLowerCase();
      const loc = (house.location || "").toLowerCase();
      const description = (house.description || "").toLowerCase();
      return title.includes(q) || loc.includes(q) || description.includes(q);
    });
  }, [houses, searchQuery]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.location.trim()) chips.push({ k: "location", label: `📍 ${filters.location.trim()}` });
    if (filters.type) chips.push({ k: "type", label: `🏷️ ${filters.type}` });
    if (filters.beds) chips.push({ k: "beds", label: `🛏️ ${filters.beds}+ beds` });
    if (filters.minRent) chips.push({ k: "minRent", label: `Min ₹${Number(filters.minRent).toLocaleString("en-IN")}` });
    if (filters.maxRent) chips.push({ k: "maxRent", label: `Max ₹${Number(filters.maxRent).toLocaleString("en-IN")}` });
    if (searchQuery.trim()) chips.push({ k: "search", label: `🔎 ${searchQuery.trim()}` });
    return chips;
  }, [filters, searchQuery]);

  const removeChip = async (key) => {
    if (key === "search") setSearchQuery("");
    else setFilters((p) => ({ ...p, [key]: "" }));

    await loadHouses({
      location: key === "location" ? "" : filters.location,
      type: key === "type" ? "" : filters.type,
      beds: key === "beds" ? "" : filters.beds,
      minRent: key === "minRent" ? "" : filters.minRent,
      maxRent: key === "maxRent" ? "" : filters.maxRent,
      search: key === "search" ? "" : searchQuery,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HERO */}
      <div className="relative overflow-hidden text-white">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_20%,white,transparent_45%),radial-gradient(circle_at_50%_80%,white,transparent_50%)]" />
        <div className="absolute -top-24 -left-28 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl animate-floatH1" />
        <div className="absolute top-10 -right-36 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl animate-floatH2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm">
            <Home className="w-4 h-4" />
            Browse rentals • Verified listings
          </div>

          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
              Perfect Home
            </span>
          </h1>

          <p className="mt-3 text-white/85 text-lg max-w-2xl">
            Search faster, filter smarter, and discover the best rental options in one place.
          </p>

          {/* ✅ Search Row */}
          <div className="mt-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-4 shadow-2xl shadow-black/20">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location, or description..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 text-gray-900 placeholder:text-gray-500 border border-white/40 focus:ring-2 focus:ring-white/60 focus:outline-none shadow-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 bg-white/15 border border-white/20 rounded-2xl hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-semibold">Filters</span>
              </button>

              <button
                onClick={() => loadHouses()}
                className="px-6 py-4 bg-white text-indigo-700 rounded-2xl hover:bg-indigo-50 transition font-semibold"
                title="Search"
              >
                Search
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeChips.map((c) => (
                  <button
                    key={c.k}
                    onClick={() => removeChip(c.k)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm hover:bg-white/20 transition"
                    title="Remove"
                  >
                    {c.label}
                    <X className="w-4 h-4 opacity-80" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* animations */}
        <style>{`
          @keyframes floatH1 { 0%{transform:translate(0,0)} 50%{transform:translate(18px,10px)} 100%{transform:translate(0,0)} }
          @keyframes floatH2 { 0%{transform:translate(0,0)} 50%{transform:translate(-14px,12px)} 100%{transform:translate(0,0)} }
          .animate-floatH1{animation:floatH1 12s ease-in-out infinite;}
          .animate-floatH2{animation:floatH2 14s ease-in-out infinite;}
          @keyframes slideDown { from{opacity:0; transform:translateY(-6px)} to{opacity:1; transform:translateY(0)} }
          .animate-slideDown{animation:slideDown .18s ease-out;}
          @keyframes floatBgA { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,12px) scale(1.05)} 100%{transform:translate(0,0) scale(1)} }
          @keyframes floatBgB { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-14px,10px) scale(1.06)} 100%{transform:translate(0,0) scale(1)} }
          .animate-floatBgA{animation:floatBgA 18s ease-in-out infinite;}
          .animate-floatBgB{animation:floatBgB 22s ease-in-out infinite;}
        `}</style>
      </div>

      {/* ✅ RESULTS AREA WITH GRADIENT BACKGROUND (this is your “white portion” fix) */}
      <section className="relative overflow-hidden">
        {/* Background wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/60 to-white" />
        {/* Subtle dots */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:18px_18px]" />
        {/* Blobs */}
        <div className="absolute -top-28 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-3xl animate-floatBgA" />
        <div className="absolute top-10 -right-44 h-[560px] w-[560px] rounded-full bg-purple-300/20 blur-3xl animate-floatBgB" />
        <div className="absolute -bottom-44 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-fuchsia-300/20 blur-3xl animate-floatBgA" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ✅ Filters Panel */}
          {showFilters && (
            <div className="bg-white/85 backdrop-blur rounded-2xl shadow-xl p-6 mb-6 animate-slideDown border border-white/70">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filter Properties</h3>
                  <p className="text-sm text-gray-600">Narrow down results in seconds.</p>
                </div>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-gray-50">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Field label="Location">
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Any location"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  />
                </Field>

                <Field label="Min Rent">
                  <input
                    type="number"
                    value={filters.minRent}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minRent: e.target.value }))}
                    placeholder="₹0"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  />
                </Field>

                <Field label="Max Rent">
                  <input
                    type="number"
                    value={filters.maxRent}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxRent: e.target.value }))}
                    placeholder="Any"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  />
                </Field>

                <Field label="Property Type">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="room">Room</option>
                    <option value="house">House</option>
                  </select>
                </Field>

                <Field label="Min Bedrooms">
                  <select
                    value={filters.beds}
                    onChange={(e) => setFilters((prev) => ({ ...prev, beds: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </Field>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={applyFilters}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition bg-white"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* ✅ Results header */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 backdrop-blur px-4 py-2 shadow-sm">
              <p className="text-gray-700">
                Showing <span className="font-bold">{filteredHouses.length}</span> properties
              </p>
              <span className="h-4 w-px bg-gray-300/70" />
              <button onClick={clearFilters} className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
                Reset
              </button>
            </div>
          </div>

          {/* Houses Grid */}
          {filteredHouses.length > 0 ? (
            <div
              ref={gridRef}
              id="properties-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-24"
            >
              {filteredHouses.map((house) => (
                <HouseCard key={house._id || house.id} house={house} />
              ))}
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur rounded-3xl p-12 text-center border border-white/70 shadow-sm">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Home className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
