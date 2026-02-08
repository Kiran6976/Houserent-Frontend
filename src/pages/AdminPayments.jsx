import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
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
} from "lucide-react";
import {
  adminGetBookings,
  adminApproveBooking,
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

  // ✅ Two tabs: pending + history
  // pending -> shows paid/qr_created
  // history -> shows approved/transferred
  const [tab, setTab] = useState("pending"); // "pending" | "history"

  // ✅ Status filter inside a tab
  // pending default -> paid
  // history default -> approved
  const [status, setStatus] = useState("paid");
  const [q, setQ] = useState("");

  // ✅ Keep status in sync with tab
  useEffect(() => {
    if (tab === "pending") setStatus("paid");
    if (tab === "history") setStatus("approved");
  }, [tab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // ✅ status mapping for new backend:
      // pending tab: "pending" (recommended) or allow specific "paid" etc.
      // history tab: "approved" (recommended)
      const backendStatus =
        tab === "pending"
          ? status === "paid" || status === "qr_created"
            ? status
            : "pending"
          : status === "approved" || status === "transferred"
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
      const ids = `${b?._id || ""} ${b?.razorpayPaymentId || ""}`.toLowerCase();
      return tenant.includes(query) || landlord.includes(query) || house.includes(query) || ids.includes(query);
    });
  }, [rows, q]);

  const badge = (s) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    if (s === "paid") return <span className={`${base} bg-emerald-100 text-emerald-700`}>PAID</span>;
    if (s === "approved") return <span className={`${base} bg-indigo-100 text-indigo-700`}>APPROVED</span>;
    if (s === "transferred") return <span className={`${base} bg-green-100 text-green-700`}>TRANSFERRED</span>;
    if (s === "rejected") return <span className={`${base} bg-red-100 text-red-700`}>REJECTED</span>;
    if (s === "failed") return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    if (s === "qr_created") return <span className={`${base} bg-yellow-100 text-yellow-700`}>AWAITING</span>;
    if (s === "expired") return <span className={`${base} bg-gray-200 text-gray-700`}>EXPIRED</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{String(s).toUpperCase()}</span>;
  };

  const approve = async (id) => {
    setProcessingId(id);
    try {
      await adminApproveBooking(id, token);
      showToast("Booking approved", "success");
      fetchBookings();
    } catch (e) {
      showToast(e.message || "Approve failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const payViaUpi = async (id) => {
    setProcessingId(id);
    try {
      const data = await adminGetUpiIntent(id, token);
      if (!data?.intent) throw new Error(data?.message || "UPI intent not available");

      window.location.href = data.intent;
      showToast("Opening UPI app…", "success");
    } catch (e) {
      showToast(e.message || "UPI open failed", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const markPaid = async (id) => {
    const utr = window.prompt("Enter UTR / Transaction ID (required):");
    if (!utr) return;

    setProcessingId(id);
    try {
      await adminMarkTransferred(id, utr, token);
      showToast("Marked as transferred", "success");
      fetchBookings();
    } catch (e) {
      showToast(e.message || "Mark paid failed", "error");
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
                <p className="text-white/80">Approve booking payments and track history</p>
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

          {/* ✅ Tabs */}
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
              <div className="relative w-full sm:w-[280px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tenant/landlord/house/id..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* ✅ Status options depend on tab */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {tab === "pending" ? (
                  <>
                    <option value="paid">Paid</option>
                    <option value="qr_created">Awaiting</option>
                    <option value="pending">All Pending</option>
                  </>
                ) : (
                  <>
                    <option value="approved">Approved</option>
                    <option value="transferred">Transferred</option>
                    <option value="approved">All History</option>
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
                {tab === "pending" ? "Pending Payments" : "Payment History"}
              </div>
              <div className="text-sm text-gray-500">{filtered.length} records</div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-gray-600">No payments found for this filter.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((b) => {
                const canApprove = tab === "pending" && (b.status === "paid" || b.status === "qr_created");
                const canPay = tab === "pending" && (b.status === "approved" || b.status === "paid" || b.status === "qr_created");
                const canMarkPaid = tab === "pending" && b.status === "approved";

                const upi = b?.landlordId?.upiId;

                return (
                  <div key={b._id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {badge(b.status)}
                        <span className="text-sm text-gray-500">
                          Booking ID: <span className="font-mono">{b._id}</span>
                        </span>
                        {b.razorpayPaymentId && (
                          <span className="text-sm text-gray-500">
                            Payment: <span className="font-mono">{b.razorpayPaymentId}</span>
                          </span>
                        )}
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
                          <b>Amount:</b> ₹{b.amount}
                        </div>
                        <div>
                          <b>Landlord UPI:</b>{" "}
                          {upi ? <span className="font-mono">{upi}</span> : <span className="text-red-600 font-semibold">Not set</span>}
                        </div>

                        {/* ✅ show decision details in history */}
                        {tab === "history" && b?.adminDecision?.approvedAt && (
                          <div className="sm:col-span-2">
                            <b>Approved At:</b>{" "}
                            {new Date(b.adminDecision.approvedAt).toLocaleString("en-IN")}
                          </div>
                        )}
                        {tab === "history" && b?.adminDecision?.note && (
                          <div className="sm:col-span-2">
                            <b>Note:</b> {b.adminDecision.note}
                          </div>
                        )}

                        {b.payoutTxnId && (
                          <div className="sm:col-span-2">
                            <b>UTR:</b> <span className="font-mono">{b.payoutTxnId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions (only for Pending tab) */}
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
                          onClick={() => payViaUpi(b._id)}
                          disabled={!canPay || !upi || processingId === b._id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {processingId === b._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                          Pay via UPI
                        </button>

                        <button
                          onClick={() => markPaid(b._id)}
                          disabled={!canMarkPaid || processingId === b._id}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {processingId === b._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Banknote className="w-4 h-4" />
                          )}
                          Mark Paid
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-right">
                        <div className="font-semibold text-gray-700">History Record</div>
                        <div className="mt-1">
                          Created: {b?.createdAt ? new Date(b.createdAt).toLocaleString("en-IN") : "-"}
                        </div>
                        <div>
                          Updated: {b?.updatedAt ? new Date(b.updatedAt).toLocaleString("en-IN") : "-"}
                        </div>
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
    </div>
  );
};
