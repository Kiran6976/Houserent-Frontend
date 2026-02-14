import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Shield,
  Users,
  Check,
  X,
  Loader2,
  Mail,
  MapPin,
  User,
  Trash2,
  Home,
  LogOut,
  CreditCard,
  LifeBuoy,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const AdminDashboard = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [landlords, setLandlords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ✅ Aadhaar view state per landlord
  // { [userId]: { open: boolean, number: string|null, loading: boolean } }
  const [aadhaarView, setAadhaarView] = useState({});

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const [landlordsRes, tenantsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users?role=landlord`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/users?role=tenant`, { headers: authHeaders }),
      ]);

      const landlordsData = await landlordsRes.json().catch(() => []);
      const tenantsData = await tenantsRes.json().catch(() => []);

      if (!landlordsRes.ok) throw new Error(landlordsData?.message || "Failed to load landlords");
      if (!tenantsRes.ok) throw new Error(tenantsData?.message || "Failed to load tenants");

      setLandlords((landlordsData || []).map((l) => ({ ...l, isVerified: !!l.isVerified })));
      setTenants(tenantsData || []);
    } catch (err) {
      showToast(err.message || "Failed to load admin data", "error");

      const msg = String(err.message || "").toLowerCase();
      if (msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("token")) {
        logout?.();
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate("/admin");
  };

  const handleDelete = async (u) => {
    const ok = window.confirm(
      `Are you sure you want to delete ${u.name} (${u.role})?\n\nThis action is permanent.`
    );
    if (!ok) return;

    setProcessingId(u._id);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${u._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      if (u.role === "landlord") setLandlords((prev) => prev.filter((x) => x._id !== u._id));
      else setTenants((prev) => prev.filter((x) => x._id !== u._id));

      // cleanup aadhaar state
      setAadhaarView((prev) => {
        const copy = { ...prev };
        delete copy[u._id];
        return copy;
      });

      showToast("User deleted successfully", "success");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = async (id, verified) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/verify`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isVerified: verified }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Action failed");

      setLandlords((prev) => prev.map((l) => (l._id === id ? { ...l, isVerified: verified } : l)));

      showToast(verified ? "Landlord verified" : "Landlord unverified", "success");
    } catch (err) {
      showToast(err.message || "Action failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ View full Aadhaar (fetch only when admin clicks eye)
  // Backend required: GET /api/admin/users/:id/aadhaar -> { success:true, aadhaarNumber:"1234..." }
  const handleToggleAadhaar = async (id) => {
    const current = aadhaarView[id];

    // close if already open
    if (current?.open) {
      setAadhaarView((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), open: false },
      }));
      return;
    }

    // open if we already have number cached
    if (current?.number) {
      setAadhaarView((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), open: true, loading: false },
      }));
      return;
    }

    // fetch full number
    setAadhaarView((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), open: true, loading: true, number: null },
    }));

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/aadhaar`, {
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to fetch Aadhaar");

      setAadhaarView((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          open: true,
          loading: false,
          number: data?.aadhaarNumber || data?.aadhaar || null,
        },
      }));
    } catch (err) {
      setAadhaarView((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), open: false, loading: false, number: null },
      }));
      showToast(err.message || "Failed to fetch Aadhaar", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/80">Manage landlords, tenants and houses</p>
              </div>
            </div>

            {/* ✅ NEW: Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/houses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <Home className="w-4 h-4" />
                View All Houses
              </Link>

              <Link
                to="/admin/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <LifeBuoy className="w-4 h-4" />
                Support Tickets
              </Link>

              <Link
                to="/admin/payments"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <CreditCard className="w-4 h-4" />
                Payments
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Landlords */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Landlords
              </h2>
              <span className="text-sm text-gray-500">{landlords.length} total</span>
            </div>

            <div className="divide-y">
              {landlords.length === 0 ? (
                <div className="py-6 text-gray-600">No landlords found.</div>
              ) : (
                landlords.map((l) => (
                  <div
                    key={l._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    {/* LEFT INFO */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                        {l.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{l.name}</div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 min-w-0">
                          <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                            <Mail className="w-4 h-4 flex-shrink-0" /> {l.email}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                            <MapPin className="w-4 h-4 flex-shrink-0" /> {l.address}
                          </span>

                          {/* ✅ Aadhaar BELOW address (same styling style; no layout redesign) */}
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="text-gray-600">
                                Aadhaar:{" "}
                                <span className="font-medium text-gray-900">
                                  {aadhaarView[l._id]?.open
                                    ? aadhaarView[l._id]?.loading
                                      ? "Loading..."
                                      : aadhaarView[l._id]?.number || "Not available"
                                    : l.aadhaarLast4
                                    ? `•••• •••• ${l.aadhaarLast4}`
                                    : "Not provided"}
                                </span>
                              </span>

                              {l.aadhaarLast4 && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleAadhaar(l._id)}
                                  className="inline-flex items-center justify-center"
                                  title={aadhaarView[l._id]?.open ? "Hide Aadhaar" : "View Aadhaar"}
                                >
                                  {aadhaarView[l._id]?.open ? (
                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-500" />
                                  )}
                                </button>
                              )}

                              {!!l.aadhaarVerified && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Aadhaar Verified
                                </span>
                              )}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center flex-wrap gap-2 justify-end">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          l.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {l.isVerified ? "Verified" : "Pending"}
                      </span>

                      <button
                        onClick={() => handleVerify(l._id, !l.isVerified)}
                        disabled={processingId === l._id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition disabled:opacity-50 ${
                          l.isVerified
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {processingId === l._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : l.isVerified ? (
                          <>
                            <X className="w-4 h-4" /> Unverify
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Verify
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete({ ...l, role: "landlord" })}
                        disabled={processingId === l._id}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {processingId === l._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tenants */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Tenants
              </h2>
              <span className="text-sm text-gray-500">{tenants.length} total</span>
            </div>

            <div className="divide-y">
              {tenants.length === 0 ? (
                <div className="py-6 text-gray-600">No tenants found.</div>
              ) : (
                tenants.map((t) => (
                  <div
                    key={t._id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    {/* LEFT INFO */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                        {t.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{t.name}</div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 min-w-0">
                          <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                            <Mail className="w-4 h-4 flex-shrink-0" /> {t.email}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                            <MapPin className="w-4 h-4 flex-shrink-0" /> {t.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="flex items-center flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleDelete({ ...t, role: "tenant" })}
                        disabled={processingId === t._id}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {processingId === t._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" /> Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Optional footer spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
};
