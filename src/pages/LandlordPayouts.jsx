// src/pages/LandlordPayouts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  Loader2,
  Search,
  Wallet,
  Receipt,
  Filter,
  Copy,
  Calendar,
  User2,
  Home as HomeIcon,
} from "lucide-react";
import { landlordGetPayouts } from "../services/landlordApi";

export const LandlordPayouts = () => {
  const { token, user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("transferred");
  const [q, setQ] = useState("");

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await landlordGetPayouts(token, status);
      setRows(data?.bookings || []);
    } catch (e) {
      showToast(e.message || "Failed to load payouts", "error");
      if (e?.statusCode === 401) {
        logout?.();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (user?.role !== "landlord") return;
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((b) => {
      const house = `${b?.houseId?.title || ""} ${b?.houseId?.location || ""}`.toLowerCase();
      const tenant = `${b?.tenantId?.name || ""} ${b?.tenantId?.email || ""}`.toLowerCase();
      const ids = `${b?._id || ""} ${b?.payoutTxnId || ""}`.toLowerCase();
      return house.includes(query) || tenant.includes(query) || ids.includes(query);
    });
  }, [rows, q]);

  const summary = useMemo(() => {
    const total = filtered.reduce((acc, b) => acc + Number(b?.amount || 0), 0);
    const transferredCount = filtered.filter((b) => b?.status === "transferred").length;
    const approvedCount = filtered.filter((b) => b?.status === "approved").length;
    return { total, transferredCount, approvedCount };
  }, [filtered]);

  const copyText = async (text, label = "Copied!") => {
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(label, "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const statusPill = (s) => {
    const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
    if (s === "transferred")
      return (
        <span className={`${base} bg-emerald-100 text-emerald-700`}>
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          TRANSFERRED
        </span>
      );
    if (s === "approved")
      return (
        <span className={`${base} bg-indigo-100 text-indigo-700`}>
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          APPROVED
        </span>
      );
    return (
      <span className={`${base} bg-gray-100 text-gray-700`}>
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        {String(s || "unknown").toUpperCase()}
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCreated = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Booking Fee Payouts</h1>
                <p className="text-white/80">Track your transferred booking fees (admin payouts)</p>
              </div>
            </div>

            <Link
              to="/landlord/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/15 border border-white/20 rounded-xl p-4">
              <div className="text-xs text-white/80">Total (current filter)</div>
              <div className="text-2xl font-extrabold">₹{summary.total.toLocaleString("en-IN")}</div>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl p-4">
              <div className="text-xs text-white/80">Transferred</div>
              <div className="text-2xl font-extrabold">{summary.transferredCount}</div>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl p-4">
              <div className="text-xs text-white/80">Approved</div>
              <div className="text-2xl font-extrabold">{summary.approvedCount}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter className="w-4 h-4 text-indigo-600" />
              Filters
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-[320px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search house/tenant/id/utr..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="transferred">Transferred</option>
                <option value="approved">Approved (Not yet paid)</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={fetchPayouts}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <Receipt className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                Payout Records
              </div>
              <div className="text-sm text-gray-500">{filtered.length} records</div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8">
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Wallet className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="mt-4 text-lg font-bold text-gray-900">No payout records found</div>
                <div className="mt-1 text-sm text-gray-600">
                  Try changing the status filter or search by booking ID / UTR.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {filtered.map((b) => (
                <div
                  key={b._id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {statusPill(b.status)}

                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            Booking ID:
                            <span className="ml-1 font-mono truncate max-w-[220px] sm:max-w-none">{b._id}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => copyText(b._id, "Booking ID copied")}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </button>
                        </div>

                        {/* Title */}
                        <div className="mt-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                            <HomeIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                            <span className="truncate">{b?.houseId?.title || "Property"}</span>
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{b?.houseId?.location || "Location not available"}</p>
                        </div>
                      </div>

                      {/* Amount box */}
                      <div className="shrink-0 w-full sm:w-auto">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center sm:text-right">
                          <div className="text-xs font-semibold text-emerald-700">Payout Amount</div>
                          <div className="text-2xl font-extrabold text-emerald-800">
                            ₹{Number(b?.amount || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-5 h-px bg-gray-100" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tenant */}
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <User2 className="w-4 h-4 text-indigo-600" />
                          Tenant
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-900">{b?.tenantId?.name || "N/A"}</div>
                        <div className="text-sm text-gray-600 break-all">{b?.tenantId?.email || "—"}</div>
                      </div>

                      {/* Payout Info */}
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-500">Payout UTR</div>
                            <div className="mt-2 font-mono text-sm text-gray-900 break-all">
                              {b?.payoutTxnId || "—"}
                            </div>
                          </div>

                          {b?.payoutTxnId && (
                            <button
                              type="button"
                              onClick={() => copyText(b.payoutTxnId, "UTR copied")}
                              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                          )}
                        </div>

                        <div className="mt-4 text-sm text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold">Payout Date:</span>
                          <span className="text-gray-700">{formatDate(b?.payoutAt)}</span>
                        </div>
                      </div>

                      {/* Created */}
                      <div className="rounded-xl bg-white border border-gray-100 p-4 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Created:</span> {formatCreated(b?.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tip: Use search to find payout by UTR / Booking ID.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle hover accent */}
                    <div className="mt-5 h-1 rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};
