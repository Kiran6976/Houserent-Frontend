import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Home, Search, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
        (landlord.email || "").toLowerCase().includes(s)
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
    // Only fetch if admin
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
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search house, address, city, landlord..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {loading ? (
            <p className="text-gray-600">Loading houses...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600">No houses found.</p>
          ) : (
            <div className="grid gap-4">
              {filtered.map((h) => {
                const landlord = h.landlordId || {};
                const image =
                  (Array.isArray(h.images) && h.images[0]) ||
                  (Array.isArray(h.imageUrls) && h.imageUrls[0]) ||
                  h.image ||
                  "https://via.placeholder.com/800x500?text=House";

                return (
                  <div
                    key={h._id}
                    className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                  >
                    <img
                      src={image}
                      alt={h.title || "House"}
                      className="w-full sm:w-44 h-36 object-cover rounded-lg border"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {h.title || "House Listing"}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            {h.address || h.location || h.city || "—"}
                          </p>

                          <p className="text-xs text-gray-500 mt-2">
                            Landlord:{" "}
                            <span className="font-medium text-gray-700">
                              {landlord.name || "—"}
                            </span>{" "}
                            • {landlord.email || "—"} • {landlord.phone || "—"}
                          </p>

                          {h.price != null && (
                            <p className="text-sm text-gray-900 mt-2 font-medium">
                              Price: ₹{h.price}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(h._id)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                      {h.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {h.description}
                        </p>
                      )}
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
