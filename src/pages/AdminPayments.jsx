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
  Loader2,
  Receipt,
  Search,
  Shield,
  History,
  Image as ImageIcon,
  Copy,
  X,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  User2,
  Home,
  IndianRupee,
  Hash,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  adminGetBookings,
  adminApproveBooking,
  adminRejectBooking,
  adminGetUpiIntent,
  adminMarkTransferred,
} from "../services/adminApi";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));

const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/* ─── Status Badge ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide";
  if (s === "payment_submitted") return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}><Clock className="w-3 h-3" />Submitted</span>;
  if (s === "approved") return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}><BadgeCheck className="w-3 h-3" />Approved</span>;
  if (s === "transferred") return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}><CheckCircle2 className="w-3 h-3" />Transferred</span>;
  if (s === "rejected") return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}><XCircle className="w-3 h-3" />Rejected</span>;
  if (s === "failed") return <span className={`${base} bg-red-50 text-red-700 border-red-200`}><XCircle className="w-3 h-3" />Failed</span>;
  if (s === "expired") return <span className={`${base} bg-gray-100 text-gray-600 border-gray-200`}><Clock className="w-3 h-3" />Expired</span>;
  if (s === "cancelled") return <span className={`${base} bg-gray-100 text-gray-600 border-gray-200`}>Cancelled</span>;
  return <span className={`${base} bg-gray-100 text-gray-600 border-gray-200`}>{s}</span>;
};

/* ─── Info Row ─────────────────────────────────────────────── */
const InfoRow = ({ label, value, mono = false, copy, onCopy }) => (
  <div className="flex flex-col gap-0.5">
    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
    <div className={`text-sm text-gray-800 font-medium flex items-center gap-1.5 ${mono ? "font-mono" : ""}`}>
      <span className="truncate">{value || "—"}</span>
      {copy && value && (
        <button onClick={() => onCopy(value)} className="shrink-0 text-gray-400 hover:text-indigo-600 transition" title="Copy">
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

/* ─── Reject Modal ─────────────────────────────────────────── */
const RejectModal = ({ bookingId, onConfirm, onCancel }) => {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Reject Booking Payment</h3>
            <p className="text-sm text-gray-500 font-mono text-xs mt-0.5 truncate">{bookingId}</p>
          </div>
        </div>
        <textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Reason for rejection (optional) — tenant will be notified..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none outline-none" />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => onConfirm(note)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition">Confirm Reject</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Mark Transferred Modal ───────────────────────────────── */
const TransferModal = ({ bookingId, amount, onConfirm, onCancel }) => {
  const [utr, setUtr] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Mark as Transferred</h3>
            <p className="text-sm text-gray-500 mt-0.5">Payout amount: <span className="font-bold text-gray-800">{fmtINR(amount)}</span></p>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payout UTR / Transaction ID <span className="text-rose-500">*</span></label>
          <input autoFocus value={utr} onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 123456789012"
            className="mt-1.5 w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none" />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => utr.trim() && onConfirm(utr.trim())} disabled={!utr.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
            <Banknote className="w-4 h-4" />Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── UPI / QR Modal ───────────────────────────────────────── */
const UpiModal = ({ upiData, onClose, onCopy }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pay Landlord via UPI</h3>
          <p className="text-xs text-gray-500 mt-0.5">{upiData?.note || "Scan QR or open UPI app to transfer payout"}</p>
        </div>
        <button onClick={onClose} className="shrink-0 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-5 overflow-y-auto space-y-4">
        {/* Payee + Amount Card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Payee</div>
            <div className="font-bold text-gray-900 mt-0.5">{upiData?.payee?.name || "Landlord"}</div>
            <div className="text-xs font-mono text-gray-600 mt-1 break-all">{upiData?.payee?.upiId}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">Amount</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{fmtINR(upiData?.amount)}</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono break-all">Booking: {upiData?.bookingId}</div>

        {/* QR Code */}
        {upiData?.intent && (
          <div className="flex justify-center">
            <div className="rounded-2xl border-2 border-indigo-100 p-4 bg-white shadow-sm">
              <QRCodeCanvas value={upiData.intent} size={220} />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 text-center">📱 On laptop? Scan QR with your phone's UPI app.</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => (window.location.href = upiData.intent)}
            className="py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4" />Open UPI App
          </button>
          <button onClick={() => onCopy(upiData.intent)}
            className="py-2.5 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2 text-sm">
            <Copy className="w-4 h-4" />Copy UPI Link
          </button>
          <button onClick={() => onCopy(upiData?.payee?.upiId)}
            className="py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
            <Copy className="w-4 h-4" />Copy UPI ID
          </button>
          <button onClick={onClose}
            className="py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm">
            Close
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">After paying, use <b>Mark Transferred</b> to record the payout UTR.</p>
      </div>
    </div>
  </div>
);

/* ─── Booking Card ─────────────────────────────────────────── */
const BookingCard = ({ b, tab, processingId, upiLoading, onApprove, onReject, onOpenUpi, onMarkTransferred, onCopy }) => {
  const landlordUpi = b?.landlordId?.upiId;
  const canApprove = tab === "pending" && b.status === "payment_submitted";
  const canReject = tab === "pending" && b.status === "payment_submitted";
  const canPay = tab === "history" && b.status === "approved";
  const canMarkTransferred = tab === "history" && b.status === "approved";
  const busy = processingId === b._id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={b.status} />
          <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">#{b._id}</span>
        </div>
        <div className="text-xs text-gray-400">{timeAgo(b.createdAt)}</div>
      </div>

      {/* House */}
      <div className="flex items-center gap-2">
        <Home className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="font-semibold text-gray-900 truncate">{b?.houseId?.title || "House"}</span>
        {b?.houseId?.location && <span className="text-xs text-gray-500 shrink-0">({b.houseId.location})</span>}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <InfoRow label="Tenant" value={b?.tenantId?.name} />
        <InfoRow label="Tenant Email" value={b?.tenantId?.email} />
        <InfoRow label="Landlord" value={b?.landlordId?.name} />
        <InfoRow label="Landlord Email" value={b?.landlordId?.email} />
        <InfoRow label="Amount" value={fmtINR(b.amount)} />
        <InfoRow label="Landlord UPI" value={landlordUpi || "⚠ Not set"} mono copy onCopy={onCopy} />
        {b?.tenantUtr && <InfoRow label="Tenant UTR" value={b.tenantUtr} mono copy onCopy={onCopy} />}
        {b?.payoutTxnId && <InfoRow label="Payout UTR" value={b.payoutTxnId} mono copy onCopy={onCopy} />}
      </div>

      {/* Payment proof */}
      {b?.paymentProofUrl && (
        <a href={b.paymentProofUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition text-sm font-medium">
          <ImageIcon className="w-4 h-4" />View Payment Screenshot<ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
        {tab === "pending" ? (
          <>
            <button onClick={() => onApprove(b._id)} disabled={!canApprove || busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}Approve
            </button>
            <button onClick={() => onReject(b._id)} disabled={!canReject || busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onOpenUpi(b._id)} disabled={!canPay || !landlordUpi || busy || upiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}Pay UPI / QR
            </button>
            <button onClick={() => onMarkTransferred(b._id, b.amount)} disabled={!canMarkTransferred || busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}Mark Transferred
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────── */
export const AdminPayments = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [tab, setTab] = useState("pending");
  const [status, setStatus] = useState("payment_submitted");
  const [q, setQ] = useState("");

  // Modals
  const [rejectTarget, setRejectTarget] = useState(null); // booking id
  const [transferTarget, setTransferTarget] = useState(null); // { id, amount }
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiData, setUpiData] = useState(null);
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
          ? status === "payment_submitted" || status === "pending" ? status : "pending"
          : status === "approved" || status === "transferred" || status === "rejected" ? status : "approved";

      const data = await adminGetBookings(token, backendStatus);
      setRows(data?.bookings || []);
    } catch (e) {
      showToast(e.message || "Failed to load bookings", "error");
      if (e?.statusCode === 401) { logout?.(); navigate("/admin"); }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!token) return; fetchBookings(); }, [tab, status, token]);

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

  /* ── Stats ── */
  const totalAmount = rows.reduce((s, b) => s + Number(b.amount || 0), 0);

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(String(text || "")); showToast("Copied ✅", "success"); }
    catch { showToast("Copy failed", "error"); }
  };

  /* ── Action Handlers ── */
  const approve = async (id) => {
    setProcessingId(id);
    try { await adminApproveBooking(id, token); showToast("Booking approved ✅", "success"); fetchBookings(); }
    catch (e) { showToast(e.message || "Approve failed", "error"); }
    finally { setProcessingId(null); }
  };

  const rejectConfirm = async (note) => {
    const id = rejectTarget;
    setRejectTarget(null);
    setProcessingId(id);
    try { await adminRejectBooking(id, note, token); showToast("Booking rejected", "success"); fetchBookings(); }
    catch (e) { showToast(e.message || "Reject failed", "error"); }
    finally { setProcessingId(null); }
  };

  const openUpiModal = async (bookingId) => {
    setProcessingId(bookingId); setUpiLoading(true);
    try {
      const data = await adminGetUpiIntent(bookingId, token);
      if (!data?.intent) throw new Error(data?.message || "UPI intent not available");
      setUpiData(data); setUpiOpen(true);
      if (/Android|iPhone|iPad/i.test(navigator.userAgent)) window.location.href = data.intent;
    } catch (e) { showToast(e.message || "UPI open failed", "error"); }
    finally { setUpiLoading(false); setProcessingId(null); }
  };

  const transferConfirm = async (utr) => {
    const { id } = transferTarget;
    setTransferTarget(null);
    setProcessingId(id);
    try { await adminMarkTransferred(id, utr, token); showToast("Marked as transferred ✅", "success"); fetchBookings(); }
    catch (e) { showToast(e.message || "Mark transferred failed", "error"); }
    finally { setProcessingId(null); }
  };

  /* ── Status options for select ── */
  const statusOptions = tab === "pending"
    ? [{ v: "payment_submitted", l: "Payment Submitted" }, { v: "pending", l: "All Pending" }]
    : [{ v: "approved", l: "Approved" }, { v: "transferred", l: "Transferred" }, { v: "rejected", l: "Rejected" }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Payments</h1>
                <p className="text-white/75 text-sm mt-0.5">Verify proof, approve bookings & transfer payouts</p>
              </div>
            </div>
            <Link to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 transition text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />Back
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-2">
            {[{ key: "pending", icon: <CreditCard className="w-4 h-4" />, label: "Pending" },
            { key: "history", icon: <History className="w-4 h-4" />, label: "History" }].map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition text-sm ${tab === key ? "bg-white text-indigo-700 shadow-sm" : "bg-white/15 text-white hover:bg-white/25"}`}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Bar ── */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Total Records", value: rows.length, icon: <Receipt className="w-4 h-4" />, color: "indigo" },
              { label: "Filtered Results", value: filtered.length, icon: <Filter className="w-4 h-4" />, color: "violet" },
              { label: "Total Amount", value: fmtINR(totalAmount), icon: <IndianRupee className="w-4 h-4" />, color: "emerald" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>{icon}</div>
                <div>
                  <div className="text-lg font-black text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filter Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search tenant, landlord, house, UTR..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none bg-gray-50" />
          </div>
          <div className="flex gap-2 shrink-0">
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-gray-50 text-gray-700">
              {statusOptions.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={fetchBookings}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
              <RefreshCw className="w-4 h-4" />Refresh
            </button>
          </div>
        </div>

        {/* ── Section Title ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-bold">
            {tab === "pending" ? <><CreditCard className="w-5 h-5 text-indigo-500" />Pending Verifications</> : <><History className="w-5 h-5 text-indigo-500" />Payment History</>}
          </div>
          <span className="text-sm text-gray-400">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-gray-400">Loading payments...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold">No payments found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different filter or search query.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((b) => (
              <BookingCard key={b._id} b={b} tab={tab} processingId={processingId} upiLoading={upiLoading}
                onApprove={approve}
                onReject={(id) => setRejectTarget(id)}
                onOpenUpi={openUpiModal}
                onMarkTransferred={(id, amount) => setTransferTarget({ id, amount })}
                onCopy={copyText}
              />
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* ── Modals ── */}
      {rejectTarget && (
        <RejectModal bookingId={rejectTarget} onConfirm={rejectConfirm} onCancel={() => setRejectTarget(null)} />
      )}

      {transferTarget && (
        <TransferModal bookingId={transferTarget.id} amount={transferTarget.amount}
          onConfirm={transferConfirm} onCancel={() => setTransferTarget(null)} />
      )}

      {upiOpen && upiData && (
        <UpiModal upiData={upiData} onClose={() => { setUpiOpen(false); setUpiData(null); }} onCopy={copyText} />
      )}
    </div>
  );
};
