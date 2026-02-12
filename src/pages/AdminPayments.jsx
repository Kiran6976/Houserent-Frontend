// src/pages/AdminPayments.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CreditCard,
  ExternalLink,
  Filter,
  Loader2,
  Receipt,
  Search,
  Shield,
  History,
  Image as ImageIcon,
  Copy,
  X,
  QrCode,
} from "lucide-react";
import {
  adminGetBookings,
  adminApproveBooking,
  adminRejectBooking,
  adminGetUpiIntent,
  adminMarkTransferred,
} from "../services/adminApi";

export const AdminPayments = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [tab, setTab] = useState("pending"); // pending | history
  const [status, setStatus] = useState("payment_submitted");
  const [q, setQ] = useState("");

  // ✅ UPI Modal State (QR + intent)
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiData, setUpiData] = useState(null); // { intent, amount, payee, bookingId, note }
  const [upiLoading, setUpiLoading] = useState(false);

  useEffect(() => {
    if (tab === "pending") setStatus("payment_submitted");
    if (tab === "history") setStatus("approved");
  }, [tab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const backendStatus =
        tab === "pending"
          ? status === "payment_submitted" || status === "pending"
            ? status
            : "pending"
          : status === "approved" || status === "transferred" || status === "rejected"
          ? status
          : "approved";

      const data = await adminGetBookings(token, backendStatus);
      setRows(data?.bookings || []);
    } catch (e) {
      showToast(e.message || "Failed to load bookings", "error");
      if (e?.statusCode === 401) {
        logout?.();
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, status, token]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((b) => {
      const tenant = `${b?.tenantId?.name || ""} ${b?.tenantId?.email || ""}`.toLowerCase();
      const landlord = `${b?.landlordId?.name || ""} ${b?.landlordId?.email || ""}`.toLowerCase();
      const house = `${b?.houseId?.title || ""} ${b?.houseId?.location || ""}`.toLowerCase();
      const ids = `${b?._id || ""} ${b?.tenantUtr || ""} ${b?.payoutTxnId || ""}`.toLowerCase();
      return tenant.includes(query) || landlord.includes(query) || house.includes(query) || ids.includes(query);
    });
  }, [rows, q]);

  const badge = (s) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    if (s === "payment_submitted") return <span className={`${base} bg-blue-100 text-blue-700`}>SUBMITTED</span>;
    if (s === "approved") return <span className={`${base} bg-indigo-100 text-indigo-700`}>APPROVED</span>;
    if (s === "transferred") return <span className={`${base} bg-green-100 text-green-700`}>TRANSFERRED</span>;
    if (s === "rejected") return <span className={`${base} bg-red-100 text-red-700`}>REJECTED</span>;
    if (s === "failed") return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    if (s === "expired") return <span className={`${base} bg-gray-200 text-gray-700`}>EXPIRED</span>;
    if (s === "cancelled") return <span className={`${base} bg-gray-200 text-gray-700`}>CANCELLED</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{String(s).toUpperCase()}</span>;
  };

  const approve = async (id) => {
    setProcessingId(id);
    try {
      await adminApproveBooking(id, token);
      showToast("Booking approved ✅", "success");
      fetchBookings();
    } catch (e) {
      showToast(e.message || "Approve failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    const note = window.prompt("Reject note (optional):") || "";
    setProcessingId(id);
    try {
      await adminRejectBooking(id, note, token);
      showToast("Booking rejected", "success");
      fetchBookings();
    } catch (e) {
      showToast(e.message || "Reject failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const isMobile = () => {
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      showToast("Copied ✅", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  // ✅ Open QR modal + optionally open UPI app on mobile
  const openUpiModal = async (bookingId) => {
    setProcessingId(bookingId);
    setUpiLoading(true);
    try {
      const data = await adminGetUpiIntent(bookingId, token);
      if (!data?.intent) throw new Error(data?.message || "UPI intent not available");

      setUpiData(data);
      setUpiOpen(true);

      // If admin is on mobile, try opening the UPI app directly too
      if (isMobile()) {
        window.location.href = data.intent;
      }
    } catch (e) {
      showToast(e.message || "UPI open failed", "error");
    } finally {
      setUpiLoading(false);
      setProcessingId(null);
    }
  };

  const closeUpiModal = () => {
    setUpiOpen(false);
    setUpiData(null);
    setUpiLoading(false);
  };

  const markTransferred = async (id) => {
    const utr = window.prompt("Enter payout UTR / Transaction ID (required):");
    if (!utr) return;

    setProcessingId(id);
    try {
      await adminMarkTransferred(id, utr, token);
      showToast("Marked as transferred ✅", "success");
      fetchBookings();
    } catch (e) {
      showToast(e.message || "Mark transferred failed", "error");
    } finally {
      setProcessingId(null);
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
                <h1 className="text-2xl font-bold">Payments</h1>
                <p className="text-white/80">Verify tenant payment proof, approve, and transfer to landlord</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setTab("pending")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                tab === "pending" ? "bg-white text-indigo-700" : "bg-white/15 text-white hover:bg-white/20"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Pending
            </button>

            <button
              onClick={() => setTab("history")}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                tab === "history" ? "bg-white text-indigo-700" : "bg-white/15 text-white hover:bg-white/20"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
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
                  placeholder="Search tenant/landlord/house/id/utr..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {tab === "pending" ? (
                  <>
                    <option value="payment_submitted">Payment Submitted</option>
                    <option value="pending">All Pending</option>
                  </>
                ) : (
                  <>
                    <option value="approved">Approved</option>
                    <option value="transferred">Transferred</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>

              <button
                onClick={fetchBookings}
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
                <CreditCard className="w-5 h-5 text-indigo-600" />
                {tab === "pending" ? "Pending Verifications" : "Payment History"}
              </div>
              <div className="text-sm text-gray-500">{filtered.length} records</div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-gray-600">No payments found for this filter.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((b) => {
                const landlordUpi = b?.landlordId?.upiId;

                const canApprove = tab === "pending" && b.status === "payment_submitted";
                const canReject = tab === "pending" && b.status === "payment_submitted";

                // ✅ FIX: Pay + Mark transferred only in HISTORY and only when APPROVED
                const canPay = tab === "history" && b.status === "approved";
                const canMarkTransferred = tab === "history" && b.status === "approved";

                return (
                  <div key={b._id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {badge(b.status)}
                        <span className="text-sm text-gray-500">
                          Booking ID: <span className="font-mono">{b._id}</span>
                        </span>
                      </div>

                      <div className="mt-2 text-gray-900 font-semibold">
                        {b?.houseId?.title || "House"}{" "}
                        <span className="text-gray-500 font-normal">({b?.houseId?.location || "N/A"})</span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                          <b>Tenant:</b> {b?.tenantId?.name} ({b?.tenantId?.email})
                        </div>
                        <div>
                          <b>Landlord:</b> {b?.landlordId?.name} ({b?.landlordId?.email})
                        </div>
                        <div>
                          <b>Amount:</b> ₹{Number(b.amount || 0)}
                        </div>
                        <div>
                          <b>Landlord UPI:</b>{" "}
                          {landlordUpi ? (
                            <span className="font-mono">{landlordUpi}</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Not set</span>
                          )}
                        </div>

                        {b?.tenantUtr && (
                          <div className="sm:col-span-2">
                            <b>Tenant UTR:</b> <span className="font-mono">{b.tenantUtr}</span>
                          </div>
                        )}

                        {b?.paymentProofUrl && (
                          <div className="sm:col-span-2">
                            <a
                              href={b.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-semibold"
                            >
                              <ImageIcon className="w-4 h-4" />
                              View Screenshot
                            </a>
                          </div>
                        )}

                        {b.payoutTxnId && (
                          <div className="sm:col-span-2">
                            <b>Payout UTR:</b> <span className="font-mono">{b.payoutTxnId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {tab === "pending" ? (
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <button
                          onClick={() => approve(b._id)}
                          disabled={!canApprove || processingId === b._id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {processingId === b._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <BadgeCheck className="w-4 h-4" />
                          )}
                          Approve
                        </button>

                        <button
                          onClick={() => reject(b._id)}
                          disabled={!canReject || processingId === b._id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {/* ✅ Pay UPI (opens QR modal + UPI intent) */}
                        <button
                          onClick={() => openUpiModal(b._id)}
                          disabled={!canPay || !landlordUpi || processingId === b._id || upiLoading}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {processingId === b._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <QrCode className="w-4 h-4" />
                          )}
                          Pay UPI / QR
                        </button>

                        <button
                          onClick={() => markTransferred(b._id)}
                          disabled={!canMarkTransferred || processingId === b._id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {processingId === b._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Banknote className="w-4 h-4" />
                          )}
                          Mark Transferred
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>

      {/* ✅ UPI / QR Modal */}
     {/* ✅ UPI / QR Modal (FULL UPDATED - SCROLLABLE) */}
{upiOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/50" onClick={closeUpiModal} />

    {/* Modal Container */}
    <div
      className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pay Landlord via UPI</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {upiData?.note || "Scan QR or open UPI app to pay landlord"}
          </p>
        </div>

        <button
          onClick={closeUpiModal}
          className="shrink-0 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
          aria-label="Close"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body (✅ scrolls) */}
      <div className="px-4 sm:px-6 py-4 overflow-y-auto overscroll-contain">
        {!upiData?.intent ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="rounded-xl border p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Payee</div>
                  <div className="font-semibold text-gray-900">{upiData?.payee?.name || "Landlord"}</div>
                  <div className="text-xs text-gray-600 mt-1 break-all">
                    UPI: <span className="font-mono font-semibold">{upiData?.payee?.upiId}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{Number(upiData?.amount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-3 break-all">
                Booking ID: <span className="font-mono">{upiData?.bookingId}</span>
              </div>
            </div>

            {/* QR */}
            <div className="mt-4 flex justify-center">
              <div className="rounded-xl border p-3 bg-white">
                <QRCodeCanvas value={upiData.intent} size={240} />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-600 text-center">
              Tip: If you are on laptop, scan this QR using your phone’s UPI app.
            </p>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => (window.location.href = upiData.intent)}
                className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
                type="button"
              >
                <ExternalLink className="w-4 h-4" />
                Open UPI App
              </button>

              <button
                onClick={() => copyText(upiData.intent)}
                className="w-full py-2.5 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition flex items-center justify-center gap-2"
                type="button"
              >
                <Copy className="w-4 h-4" />
                Copy UPI Link
              </button>

              <button
                onClick={() => copyText(upiData?.payee?.upiId)}
                className="w-full py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                type="button"
              >
                <Copy className="w-4 h-4" />
                Copy UPI ID
              </button>

              <button
                onClick={closeUpiModal}
                className="w-full py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              After paying, go back and click <b>Mark Transferred</b> to enter payout UTR.
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};
