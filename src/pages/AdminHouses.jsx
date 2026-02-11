import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Home,
  Search,
  Trash2,
  MapPin,
  IndianRupee,
  User2,
  Mail,
  Phone,
  ImageOff,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const fallbackImg = "https://via.placeholder.com/800x500?text=House";

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
    {children}
  </span>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border bg-white p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="h-44 sm:h-36 sm:w-52 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  </div>
);

export const AdminHouses = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return houses;

    return houses.filter((h) => {
      const landlord = h.landlordId || {};
      return (
        (h.title || "").toLowerCase().includes(s) ||
        (h.address || "").toLowerCase().includes(s) ||
        (h.city || "").toLowerCase().includes(s) ||
        (h.location || "").toLowerCase().includes(s) ||
        (h.description || "").toLowerCase().includes(s) ||
        (landlord.name || "").toLowerCase().includes(s) ||
        (landlord.email || "").toLowerCase().includes(s) ||
        (landlord.phone || "").toLowerCase().includes(s)
      );
    });
  }, [houses, search]);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/houses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.message || "Failed to load houses", "error");
        return;
      }

      setHouses(data?.houses || []);
    } catch (e) {
      showToast("Network error while loading houses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const handleDelete = async (id) => {
    const ok = confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/houses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.message || "Failed to delete house", "error");
        return;
      }

      showToast("House deleted", "success");
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (e) {
      showToast("Network error while deleting", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Home className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">All Listed Houses</h1>
            <span className="text-sm text-gray-500">({filtered.length})</span>
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 backdrop-blur focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search title, city, landlord..."
            />
          </div>
        </div>

        {/* Body */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl p-4 sm:p-6 border border-white">
          {loading ? (
            <div className="grid gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-gray-500" />
              </div>
              <p className="mt-4 text-gray-700 font-medium">No houses found</p>
              <p className="text-sm text-gray-500">Try a different search keyword.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((h) => {
                const landlord = h.landlordId || {};

                const image =
                  (Array.isArray(h.images) && h.images[0]) ||
                  (Array.isArray(h.imageUrls) && h.imageUrls[0]) ||
                  h.image ||
                  fallbackImg;

                const locationText =
                  h.address || h.location || h.city || "—";

                const price =
                  h.price ?? h.rent ?? h.amount ?? null;

                return (
                  <div
                    key={h._id}
                    className="group rounded-2xl border bg-white p-4 sm:p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full sm:w-52">
                        <div className="relative overflow-hidden rounded-xl border bg-gray-50 h-44 sm:h-36">
                          <img
                            src={image}
                            alt={h.title || "House"}
                            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = fallbackImg;
                            }}
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {h.title || "House Listing"}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <Pill>
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[240px]">{locationText}</span>
                              </Pill>

                              {h.city && (
                                <Pill>
                                  <span className="font-medium">{h.city}</span>
                                </Pill>
                              )}

                              {price != null && (
                                <Pill>
                                  <IndianRupee className="w-3.5 h-3.5" />
                                  <span className="font-medium">{price}</span>
                                </Pill>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <button
                            onClick={() => handleDelete(h._id)}
                            className="shrink-0 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>

                        {/* Landlord */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <User2 className="w-4 h-4 text-gray-400" />
                            <span className="truncate">
                              {landlord.name || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">
                              {landlord.email || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="truncate">
                              {landlord.phone || "—"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {h.description ? h.description : "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Mobile delete full width */}
                    <div className="mt-4 sm:hidden">
                      <button
                        onClick={() => handleDelete(h._id)}
                        className="w-full px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Listing
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
