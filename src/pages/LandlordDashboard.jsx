import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { HouseCard } from "../components/HouseCard";
import {
  Plus,
  Home,
  Mail,
  MapPin,
  Loader2,
  Building,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Save,
  Pencil,
  Users,
  Search,
  ArrowUpDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const LandlordDashboard = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ UPI form state
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiInput, setUpiInput] = useState(user?.upiId || "");
  const [savingUpi, setSavingUpi] = useState(false);

  // ✅ UI: search + sort
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("newest");

  useEffect(() => {
    setUpiInput(user?.upiId || "");
  }, [user?.upiId]);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchMyHouses = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/houses/my`, { headers: authHeaders });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load houses");
      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = String(err.message || "").toLowerCase();
      showToast(err.message || "Failed to load houses", "error");
      if (msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("token")) {
        logout?.();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleEdit = (houseId) => navigate(`/landlord/edit-house/${houseId}`);
  const handleDelete = (houseId) => setDeleteConfirm(houseId);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/houses/${deleteConfirm}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setHouses((prev) => prev.filter((h) => (h._id || h.id) !== deleteConfirm));
      showToast("House deleted successfully", "success");
      setDeleteConfirm(null);
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const saveUpi = async () => {
    if (!token) {
      showToast("Please login again", "error");
      return;
    }

    const cleaned = String(upiInput || "").trim();
    if (!cleaned) return showToast("UPI ID is required", "error");
    if (!cleaned.includes("@"))
      return showToast("Invalid UPI ID format (example: name@bank)", "error");

    setSavingUpi(true);
    try {
      const res = await fetch(`${API_URL}/api/landlord/upi`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ upiId: cleaned }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to save UPI ID");

      const updated = data?.user || { ...(user || {}), upiId: data?.upiId || cleaned };

      if (typeof updateUser === "function") updateUser(updated);

      try {
        const currentUserRaw = localStorage.getItem("homerent_current_user");
        const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
        const merged = {
          ...(currentUser || {}),
          ...(updated || {}),
          upiId: updated?.upiId || data?.upiId || cleaned,
        };
        localStorage.setItem("homerent_current_user", JSON.stringify(merged));
      } catch {
        // ignore
      }

      showToast("UPI ID saved ✅", "success");
      setEditingUpi(false);

      if (typeof updateUser !== "function") window.location.reload();
    } catch (err) {
      const msg = String(err.message || "").toLowerCase();
      showToast(err.message || "Failed to save UPI ID", "error");
      if (msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("token")) logout?.();
    } finally {
      setSavingUpi(false);
    }
  };

  // ✅ Filter + sort for properties grid (MOVED ABOVE loading return)
  const filteredSortedHouses = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    let list = Array.isArray(houses) ? [...houses] : [];

    if (q) {
      list = list.filter((h) => {
        const title = String(h.title || h.name || h.houseTitle || "").toLowerCase();
        const addr = String(h.address || h.location || h.city || "").toLowerCase();
        const type = String(h.type || h.propertyType || "").toLowerCase();
        return title.includes(q) || addr.includes(q) || type.includes(q);
      });
    }

    const num = (v) => Number(v || 0);

    const byNewest = (a, b) => {
      const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return db - da;
    };

    switch (sortKey) {
      case "rentHigh":
        list.sort((a, b) => num(b.rent) - num(a.rent));
        break;
      case "rentLow":
        list.sort((a, b) => num(a.rent) - num(b.rent));
        break;
      case "bookingHigh":
        list.sort((a, b) => num(b.bookingAmount) - num(a.bookingAmount));
        break;
      case "bookingLow":
        list.sort((a, b) => num(a.bookingAmount) - num(b.bookingAmount));
        break;
      case "titleAZ":
        list.sort((a, b) =>
          String(a.title || a.name || "").localeCompare(String(b.title || b.name || ""))
        );
        break;
      case "newest":
      default:
        list.sort(byNewest);
        break;
    }

    return list;
  }, [houses, query, sortKey]);

  // ✅ Now early return is safe
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-700">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="font-semibold">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const totalRent = houses.reduce((sum, h) => sum + Number(h.rent || 0), 0);
  const totalBooking = houses.reduce((sum, h) => sum + Number(h.bookingAmount || 0), 0);

  const upiId = user?.upiId || "";

  const upiStatusPill = () => {
    const base =
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset";
    if (upiId) {
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
          <CheckCircle2 className="w-4 h-4" /> UPI SET
        </span>
      );
    }
    return (
      <span className={`${base} bg-amber-50 text-amber-700 ring-amber-200`}>
        <AlertTriangle className="w-4 h-4" /> UPI NOT SET
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary */}
        <div className="relative overflow-hidden rounded-3xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

          <div className="relative p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/15 ring-1 ring-white/25 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{user?.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/85 mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user?.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/12 ring-1 ring-white/20 rounded-2xl p-4 text-center backdrop-blur">
                  <div className="text-2xl sm:text-3xl font-extrabold">{houses.length}</div>
                  <div className="text-white/80 text-xs sm:text-sm">Properties</div>
                </div>

                <div className="bg-white/12 ring-1 ring-white/20 rounded-2xl p-4 text-center backdrop-blur">
                  <div className="text-2xl sm:text-3xl font-extrabold">
                    ₹{totalRent.toLocaleString("en-IN")}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">Monthly Rent</div>
                </div>

                <div className="bg-white/12 ring-1 ring-white/20 rounded-2xl p-4 text-center backdrop-blur">
                  <div className="text-2xl sm:text-3xl font-extrabold">
                    ₹{totalBooking.toLocaleString("en-IN")}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">Booking Fees</div>
                </div>
              </div>
            </div>

            {/* UPI Setup */}
            <div className="mt-6 bg-white/10 ring-1 ring-white/15 rounded-2xl p-4 md:p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-white/15 ring-1 ring-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Payout Setup (UPI)</div>
                      <p className="text-white/80 text-sm mt-1">
                        Tenants will pay booking amount via UPI. Please set your UPI ID.
                      </p>
                    </div>
                    {upiStatusPill()}
                  </div>

                  <div className="mt-3">
                    {upiId && !editingUpi ? (
                      <div className="text-sm text-white/90">
                        Your UPI ID: <span className="font-semibold">{upiId}</span>
                      </div>
                    ) : !upiId && !editingUpi ? (
                      <div className="text-sm text-amber-100">
                        ⚠️ UPI ID not set. Add it so tenants can pay booking amount.
                      </div>
                    ) : null}
                  </div>

                  {editingUpi && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        value={upiInput}
                        onChange={(e) => setUpiInput(e.target.value)}
                        placeholder="example@bank"
                        className="w-full sm:w-[340px] px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/30"
                      />

                      <button
                        onClick={saveUpi}
                        disabled={savingUpi}
                        className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {savingUpi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {savingUpi ? "Saving..." : "Save UPI"}
                      </button>

                      <button
                        onClick={() => {
                          setEditingUpi(false);
                          setUpiInput(user?.upiId || "");
                        }}
                        disabled={savingUpi}
                        className="px-5 py-2.5 rounded-xl bg-white/15 text-white font-semibold hover:bg-white/25 transition disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!editingUpi && (
                    <div className="mt-4">
                      <button
                        onClick={() => setEditingUpi(true)}
                        className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition inline-flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        {upiId ? "Update UPI ID" : "Set UPI ID"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/70">Tip: Add more properties to increase visibility & bookings.</div>
          </div>
        </div>

        {/* Section Surface */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm">
          <div className="sticky top-0 z-10 rounded-t-3xl border-b border-slate-200/70 bg-white/80 backdrop-blur px-4 sm:px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Properties</h2>
                <p className="text-slate-600">Manage your rental listings</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/landlord/add-house"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  <Plus className="w-5 h-5" />
                  Add New Property
                </Link>

                <Link
                  to="/landlord/tenants"
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-6 py-3 rounded-2xl font-semibold hover:bg-slate-50 transition"
                >
                  <Users className="w-5 h-5 text-indigo-600" />
                  Users / Tenants
                </Link>

                <Link
                  to="/landlord/payouts"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                >
                  💰 Booking Fee Payouts
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, city, address, type…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </div>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="titleAZ">Title A → Z</option>
                  <option value="rentHigh">Rent (High → Low)</option>
                  <option value="rentLow">Rent (Low → High)</option>
                  <option value="bookingHigh">Booking (High → Low)</option>
                  <option value="bookingLow">Booking (Low → High)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6">
            {filteredSortedHouses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSortedHouses.map((house) => {
                  const houseId = house._id || house.id;
                  return (
                    <HouseCard
                      key={houseId}
                      house={house}
                      showActions
                      onEdit={() => handleEdit(houseId)}
                      onDelete={() => handleDelete(houseId)}
                    />
                  );
                })}
              </div>
            ) : houses.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Search className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">No matches found</h3>
                <p className="mt-1 text-slate-600">Try a different keyword.</p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50" />
                <div className="relative">
                  <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-indigo-200">
                    <Building className="w-10 h-10 text-indigo-700" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No properties yet</h3>
                  <p className="text-slate-600 mb-6">
                    Add your first rental property to start receiving bookings.
                  </p>
                  <Link
                    to="/landlord/add-house"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                    <Home className="w-5 h-5" />
                    Add Your First Property
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Property?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
