import React, { useEffect, useMemo, useState } from "react";
import { HouseCard } from "../components/HouseCard";
import { Search, SlidersHorizontal, X, Loader2, Home } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const TenantHouses = () => {
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

  // Load from backend
  const loadHouses = async (opts = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      const location = (opts.location ?? filters.location).trim();
      const type = (opts.type ?? filters.type).trim();
      const beds = (opts.beds ?? filters.beds).trim();
      const minRent = (opts.minRent ?? filters.minRent).trim();
      const maxRent = (opts.maxRent ?? filters.maxRent).trim();
      const search = (opts.search ?? searchQuery).trim();

      if (location) params.set("location", location);
      if (type) params.set("type", type);
      if (beds) params.set("beds", beds);
      if (minRent) params.set("minRent", minRent);
      if (maxRent) params.set("maxRent", maxRent);
      if (search) params.set("search", search);

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

  useEffect(() => {
    loadHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = async () => {
    setShowFilters(false);
    await loadHouses();
  };

  const clearFilters = async () => {
    setFilters({
      location: "",
      minRent: "",
      maxRent: "",
      type: "",
      beds: "",
    });
    setSearchQuery("");
    setShowFilters(false);

    // load without filters/search
    await loadHouses({
      location: "",
      minRent: "",
      maxRent: "",
      type: "",
      beds: "",
      search: "",
    });
  };

  // If you want "live search" like Google, uncomment this:
  // useEffect(() => {
  //   const t = setTimeout(() => loadHouses(), 350);
  //   return () => clearTimeout(t);
  // }, [searchQuery]);

  // Since backend already filters by search, this is just a safety fallback:
  const filteredHouses = useMemo(() => {
    if (!searchQuery.trim()) return houses;

    const q = searchQuery.toLowerCase();
    return houses.filter((house) => {
      const title = (house.title || "").toLowerCase();
      const location = (house.location || "").toLowerCase();
      const description = (house.description || "").toLowerCase();
      return title.includes(q) || location.includes(q) || description.includes(q);
    });
  }, [houses, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Browse through our curated selection of rental properties
          </p>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location, or description..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Optional: Search button to use backend search immediately */}
            <button
              onClick={() => loadHouses()}
              className="px-6 py-4 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 transition font-medium"
              title="Search"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filter Properties</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Any location"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent
                </label>
                <input
                  type="number"
                  value={filters.minRent}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minRent: e.target.value }))
                  }
                  placeholder="$0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent
                </label>
                <input
                  type="number"
                  value={filters.maxRent}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxRent: e.target.value }))
                  }
                  placeholder="Any"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="room">Room</option>
                  <option value="house">House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Bedrooms
                </label>
                <select
                  value={filters.beds}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, beds: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredHouses.length}</span>{" "}
            properties
          </p>
        </div>

        {/* Houses Grid */}
        {filteredHouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <HouseCard key={house._id || house.id} house={house} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
