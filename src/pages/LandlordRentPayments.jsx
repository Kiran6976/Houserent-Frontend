// pages/LandlordRentPayments.jsx (FULL UPDATED FILE)
// ✅ Uses src/services/landlordApi.js functions (no direct fetch)
// ✅ Tenant folders view + click tenant to see full rent history + approve/reject from history

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  landlordRentFolders,
  landlordRentHistoryByTenant,
  landlordApproveRentPayment,
  landlordRejectRentPayment,
} from "../services/landlordApi";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileImage,
  MapPin,
  IndianRupee,
  Users,
  Folder,
  ChevronRight,
  Calendar,
  BadgeCheck,
  Clock,
} from "lucide-react";

const statusPill = (status) => {
  const s = String(status || "").toLowerCase();
  const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold";
  if (s === "approved") return `${base} bg-emerald-100 text-emerald-700`;
  if (s === "payment_submitted") return `${base} bg-yellow-100 text-yellow-800`;
  if (s === "rejected") return `${base} bg-red-100 text-red-700`;
  if (s === "initiated") return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-gray-100 text-gray-700`;
};

export const LandlordRentPayments = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // ✅ "folders" list (tenants)
  const [folders, setFolders] = useState([]);

  // ✅ selected tenant -> history list
  const [selectedTenant, setSelectedTenant] = useState(null); // { _id, name, email, phone }
  const [history, setHistory] = useState([]);

  const [processingId, setProcessingId] = useState(null);

  const [rejecting, setRejecting] = useState(null); // paymentId
  const [rejectNote, setRejectNote] = useState("");

  const handleAuthError = (e) => {
    const msg = String(e?.message || "").toLowerCase();
    const code = e?.statusCode;
    if (code === 401 || msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("token")) {
      logout?.();
      navigate("/login");
      return true;
    }
    return false;
  };

  // ---------------------------
  // API: load tenant folders
  // ---------------------------
  const fetchFolders = async () => {
    if (!token) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await landlordRentFolders(token);
      setFolders(Array.isArray(data?.folders) ? data.folders : []);
    } catch (e) {
      showToast(e.message || "Failed to load rent folders", "error");
      handleAuthError(e);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // API: load one tenant history
  // ---------------------------
  const fetchTenantHistory = async (tenantId, tenantObj = null) => {
    if (!token || !tenantId) return;

    try {
      setLoading(true);
      const data = await landlordRentHistoryByTenant(String(tenantId), token);
      setSelectedTenant(tenantObj || { _id: tenantId });
      setHistory(Array.isArray(data?.payments) ? data.payments : []);
    } catch (e) {
      showToast(e.message || "Failed to load tenant rent history", "error");
      handleAuthError(e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: folders
  useEffect(() => {
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refresh = async () => {
    if (selectedTenant?._id) return fetchTenantHistory(selectedTenant._id, selectedTenant);
    return fetchFolders();
  };

  // ---------------------------
  // Approve / Reject actions
  // ---------------------------
  const approve = async (paymentId) => {
    if (!paymentId) return;
    setProcessingId(paymentId);

    try {
      await landlordApproveRentPayment(String(paymentId), token);

      showToast("Rent payment approved ✅", "success");

      // Update local state without refetch
      setHistory((prev) =>
        prev.map((p) =>
          String(p._id) === String(paymentId)
            ? { ...p, status: "approved", approvedAt: new Date().toISOString() }
            : p
        )
      );

      // update folder pending count optimistically
      setFolders((prev) =>
        prev.map((f) => {
          const tid = String(f?.tenant?._id || "");
          if (selectedTenant?._id && tid === String(selectedTenant._id)) {
            return { ...f, pending: Math.max(0, Number(f.pending || 0) - 1) };
          }
          return f;
        })
      );
    } catch (e) {
      showToast(e.message || "Approve failed", "error");
      handleAuthError(e);
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (paymentId) => {
    setRejecting(paymentId);
    setRejectNote("");
  };

  const reject = async () => {
    const paymentId = rejecting;
    if (!paymentId) return;

    setProcessingId(paymentId);
    try {
      await landlordRejectRentPayment(String(paymentId), rejectNote, token);

      showToast("Rent payment rejected ❌", "success");

      setHistory((prev) =>
        prev.map((p) =>
          String(p._id) === String(paymentId)
            ? {
                ...p,
                status: "rejected",
                rejectedAt: new Date().toISOString(),
                rejectionNote: String(rejectNote || "").trim(),
              }
            : p
        )
      );

      // update folder pending count optimistically
      setFolders((prev) =>
        prev.map((f) => {
          const tid = String(f?.tenant?._id || "");
          if (selectedTenant?._id && tid === String(selectedTenant._id)) {
            return { ...f, pending: Math.max(0, Number(f.pending || 0) - 1) };
          }
          return f;
        })
      );

      setRejecting(null);
      setRejectNote("");
    } catch (e) {
      showToast(e.message || "Reject failed", "error");
      handleAuthError(e);
    } finally {
      setProcessingId(null);
    }
  };

  const goBackToFolders = () => {
    setSelectedTenant(null);
    setHistory([]);
    fetchFolders();
  };

  // Counts for header
  const totalFolders = folders.length;
  const totalPendingAll = useMemo(
    () => folders.reduce((sum, f) => sum + Number(f?.pending || 0), 0),
    [folders]
  );

  const pendingInHistory = useMemo(
    () => history.filter((p) => String(p?.status || "") === "payment_submitted").length,
    [history]
  );

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
                <IndianRupee className="w-8 h-8" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold">
                  {selectedTenant?._id ? "Rent History" : "Rent Payments"}
                </h1>

                {!selectedTenant?._id ? (
                  <>
                    <p className="text-white/80">Approve / reject monthly rent payments</p>
                    <p className="text-white/80 text-sm mt-1">
                      {totalFolders} tenants • {totalPendingAll} pending approvals
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white/80 truncate">
                      {selectedTenant?.name || "Tenant"} • {selectedTenant?.email || ""}
                    </p>
                    <p className="text-white/80 text-sm mt-1">
                      {history.length} total payments • {pendingInHistory} pending in this tenant
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={refresh}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              {selectedTenant?._id ? (
                <button
                  onClick={goBackToFolders}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <Link
                  to="/landlord/tenants"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* VIEW 1: Tenant folders */}
        {!selectedTenant?._id && (
          <>
            {folders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rent payments yet</h3>
                <p className="text-gray-600">
                  Once tenants start paying monthly rent, you’ll see them grouped here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {folders.map((f) => {
                  const t = f?.tenant;
                  const tid = t?._id;
                  const pending = Number(f?.pending || 0);

                  return (
                    <button
                      key={String(tid)}
                      onClick={() => fetchTenantHistory(String(tid), t)}
                      className="text-left bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition"
                    >
                      <div className="p-5 border-b">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                              {t?.name?.charAt(0)?.toUpperCase() || "T"}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate">{t?.name || "Tenant"}</div>
                              <div className="text-sm text-gray-600 truncate">{t?.email || ""}</div>
                              <div className="text-sm text-gray-600 truncate">{t?.phone || ""}</div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Folder className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm">{Number(f?.totalPayments || 0)} records</span>
                        </div>

                        {pending > 0 ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                            <Clock className="w-4 h-4" />
                            {pending} pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            <BadgeCheck className="w-4 h-4" />
                            Up to date
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: Tenant history */}
        {selectedTenant?._id && (
          <>
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No records for this tenant</h3>
                <p className="text-gray-600">When this tenant pays rent, records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {history.map((p) => {
                  const paymentId = p?._id;
                  const house = p?.houseId;
                  const disabled = processingId === paymentId;

                  return (
                    <div key={String(paymentId)} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      {/* House */}
                      <div className="p-5 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-gray-900 truncate">
                              {house?.title || "House"}
                            </div>

                            <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-indigo-600" />
                              <span className="truncate">{house?.location || "N/A"}</span>
                            </div>

                            <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
                              <span className="inline-flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                <b>Period:</b> {p?.period || "—"}
                              </span>

                              <span className={statusPill(p?.status)}>
                                {String(p?.status || "N/A").toUpperCase()}
                              </span>
                            </div>

                            {p?.paymentSubmittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                Submitted at: {new Date(p.paymentSubmittedAt).toLocaleString("en-IN")}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-500">Amount</div>
                            <div className="font-bold text-gray-900">
                              ₹{Number(p?.amount || house?.rent || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Proof */}
                      <div className="p-5">
                        <div className="rounded-xl border bg-gray-50 p-4">
                          <div className="text-sm text-gray-700">
                            <b>UTR:</b> <span className="break-all">{p?.tenantUtr || "—"}</span>
                          </div>

                          {p?.paymentProofUrl ? (
                            <a
                              href={p.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 text-indigo-700 hover:underline text-sm"
                            >
                              <FileImage className="w-4 h-4" />
                              View Screenshot Proof
                            </a>
                          ) : (
                            <div className="mt-3 text-xs text-gray-500">No screenshot uploaded.</div>
                          )}
                        </div>

                        {/* Actions only for payment_submitted */}
                        {String(p?.status) === "payment_submitted" && (
                          <div className="mt-5 flex flex-wrap gap-2 justify-end">
                            <button
                              onClick={() => approve(paymentId)}
                              disabled={disabled}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                            >
                              {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve
                            </button>

                            <button
                              onClick={() => openReject(paymentId)}
                              disabled={disabled}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition disabled:opacity-60"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="h-6" />
      </div>

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Payment?</h3>
            <p className="text-gray-600 mb-4">Optionally add a reason so tenant can fix it.</p>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Reason (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setRejecting(null)}
                disabled={processingId === rejecting}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={processingId === rejecting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {processingId === rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
