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
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  Sofa,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const fallbackImg = "https://via.placeholder.com/800x500?text=House";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

/* ─── Shared Pills ─────────────────────────────────────────── */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 ${className}`}>
    {children}
  </span>
);

const StatusPill = ({ status }) => {
  const s = String(status || "pending").toLowerCase();
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border";
  if (s === "approved") return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}><CheckCircle2 className="w-3.5 h-3.5" />Approved</span>;
  if (s === "rejected") return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}><XCircle className="w-3.5 h-3.5" />Rejected</span>;
  return <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}><Clock className="w-3.5 h-3.5" />Pending</span>;
};

/* ─── Skeleton ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl border bg-white p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="h-44 sm:h-36 sm:w-52 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-2"><div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" /><div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" /></div>
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

/* ─── Image Gallery (for Detail Modal) ────────────────────── */
const Gallery = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const imgs = Array.isArray(images) && images.length ? images : [fallbackImg];
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ height: 260 }}>
      <img src={imgs[idx]} alt="House" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackImg; }} />
      {imgs.length > 1 && (
        <>
          <button onClick={() => setIdx((p) => (p - 1 + imgs.length) % imgs.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setIdx((p) => (p + 1) % imgs.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition ${i === idx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ house, onClose, onVerify, actionBusy }) => {
  const landlord = house.landlordId || {};
  const verificationStatus = house.verificationStatus || "pending";
  const isPending = verificationStatus === "pending";
  const billUrl = house.electricityBillUrl || "";
  const billType = String(house.electricityBillType || "").toLowerCase();
  const billIsPdf = billType.includes("pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 truncate max-w-xs">{house.title || "House Details"}</h2>
            <StatusPill status={verificationStatus} />
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Gallery */}
          <Gallery images={house.images} />

          {/* Location + Submit date */}
          <div className="flex flex-wrap gap-2 items-center">
            <Pill><MapPin className="w-3.5 h-3.5 text-indigo-500" />{house.location || "—"}</Pill>
            <Pill><CalendarDays className="w-3.5 h-3.5 text-gray-400" />Submitted {timeAgo(house.createdAt)}</Pill>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Monthly Rent", value: fmtINR(house.rent) },
              { label: "Deposit", value: fmtINR(house.deposit) },
              { label: "Booking Amount", value: fmtINR(house.bookingAmount) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
                <div className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">{label}</div>
                <div className="text-base font-bold text-indigo-700 mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {/* Property specs */}
          <div className="flex flex-wrap gap-2">
            <Pill><BedDouble className="w-3.5 h-3.5 text-indigo-400" />{house.beds ?? "—"} Beds</Pill>
            <Pill><Bath className="w-3.5 h-3.5 text-indigo-400" />{house.baths ?? "—"} Baths</Pill>
            {house.area && <Pill><Maximize2 className="w-3.5 h-3.5 text-indigo-400" />{house.area} sq ft</Pill>}
            <Pill><Building2 className="w-3.5 h-3.5 text-indigo-400" />{capitalize(house.type)}</Pill>
            <Pill><Sofa className="w-3.5 h-3.5 text-indigo-400" />{capitalize(house.furnished)}</Pill>
          </div>

          {/* Amenities */}
          {Array.isArray(house.amenities) && house.amenities.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</div>
              <div className="flex flex-wrap gap-1.5">
                {house.amenities.map((a) => (
                  <span key={a} className="px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs text-violet-700 font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</div>
            <p className="text-sm text-gray-700 leading-relaxed">{house.description || "No description provided."}</p>
          </div>

          {/* Landlord info */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Landlord</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2"><User2 className="w-4 h-4 text-gray-400" />{landlord.name || "—"}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="truncate">{landlord.email || "—"}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{landlord.phone || "—"}</div>
            </div>
          </div>

          {/* Rejection reason */}
          {verificationStatus === "rejected" && house.rejectReason && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">Rejection Reason</div>
              <p className="text-sm text-rose-700">{house.rejectReason}</p>
            </div>
          )}

          {/* Action row */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            {billUrl ? (
              <a href={billUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-sm">
                <FileText className="w-4 h-4" />View Electricity Bill {billIsPdf && "(PDF)"}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-sm text-rose-600 font-medium">⚠ Electricity bill not uploaded</div>
            )}

            <div className="flex gap-2 sm:ml-auto">
              <button type="button" disabled={!isPending || actionBusy || !billUrl}
                onClick={() => onVerify(house._id, "approved")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${!isPending || !billUrl ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                title={!billUrl ? "Bill required to approve" : "Approve house"}>
                {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
              </button>
              <button type="button" disabled={!isPending || actionBusy}
                onClick={() => onVerify(house._id, "rejected")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${!isPending ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-rose-300 text-rose-700 hover:bg-rose-50"}`}>
                {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Reject Reason Modal ──────────────────────────────────── */
const RejectModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Reject House Listing</h3>
            <p className="text-sm text-gray-500">Provide a reason so the landlord can fix and resubmit.</p>
          </div>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Electricity bill is blurry, wrong address, incomplete details..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none outline-none"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => onConfirm(reason)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition">Confirm Reject</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ─────────────────────────────────── */
const DeleteModal = ({ title, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Delete Listing?</h3>
          <p className="text-sm text-gray-500 mt-0.5">This will permanently remove <span className="font-semibold text-gray-700">"{title}"</span>. This cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"><Trash2 className="w-4 h-4" />Delete</button>
      </div>
    </div>
  </div>
);

/* ─── Main Page ────────────────────────────────────────────── */
const FILTER_TABS = ["all", "pending", "approved", "rejected"];

export const AdminHouses = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals
  const [detailHouse, setDetailHouse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [rejectTarget, setRejectTarget] = useState(null); // house id
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* ── Derived data ── */
  const stats = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    houses.forEach((h) => { const s = h.verificationStatus || "pending"; if (counts[s] !== undefined) counts[s]++; });
    return counts;
  }, [houses]);

  const filtered = useMemo(() => {
    let list = houses;
    if (filterStatus !== "all") list = list.filter((h) => (h.verificationStatus || "pending") === filterStatus);

    const s = search.trim().toLowerCase();
    if (!s) return list;
    return list.filter((h) => {
      const l = h.landlordId || {};
      return (
        (h.title || "").toLowerCase().includes(s) ||
        (h.address || "").toLowerCase().includes(s) ||
        (h.city || "").toLowerCase().includes(s) ||
        (h.location || "").toLowerCase().includes(s) ||
        (h.description || "").toLowerCase().includes(s) ||
        (l.name || "").toLowerCase().includes(s) ||
        (l.email || "").toLowerCase().includes(s) ||
        (l.phone || "").toLowerCase().includes(s)
      );
    });
  }, [houses, search, filterStatus]);

  /* ── Fetch ── */
  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/houses`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data?.message || "Failed to load houses", "error"); return; }
      setHouses(data?.houses || []);
    } catch { showToast("Network error while loading houses", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === "admin") fetchHouses(); }, [user?.role]);

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/houses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data?.message || "Failed to delete house", "error"); return; }
      showToast("House deleted", "success");
      setHouses((prev) => prev.filter((h) => h._id !== id));
      if (detailHouse?._id === id) setDetailHouse(null);
    } catch { showToast("Network error while deleting", "error"); }
  };

  /* ── Verify (approve/reject) ── */
  const handleVerify = async (houseId, status, reason = "") => {
    if (!houseId) return;
    setRejectTarget(null);
    setActionLoadingId(houseId);
    try {
      const res = await fetch(`${API_URL}/api/admin/houses/${houseId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update status");

      showToast(`House ${status}`, "success");
      const updated = data?.house || null;
      if (updated?._id) {
        setHouses((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
        if (detailHouse?._id === updated._id) setDetailHouse(updated);
      } else { fetchHouses(); }
    } catch (e) { showToast(e.message || "Verification update failed", "error"); }
    finally { setActionLoadingId(null); }
  };

  /* ── Intercept reject to show modal first ── */
  const handleVerifyInterceptReject = (houseId, status) => {
    if (status === "rejected") { setRejectTarget(houseId); return; }
    handleVerify(houseId, status);
  };

  /* ── Tab label counts ── */
  const tabCount = (tab) => {
    if (tab === "all") return houses.length;
    return stats[tab] ?? 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Home className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">All Listed Houses</h1>
          </div>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white/80 backdrop-blur focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Search title, city, landlord..."
            />
          </div>
        </div>

        {/* ── Stats Bar ── */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {[
              { label: "Pending Review", count: stats.pending, color: "amber", icon: <Clock className="w-4 h-4" /> },
              { label: "Approved", count: stats.approved, color: "emerald", icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: "Rejected", count: stats.rejected, color: "rose", icon: <XCircle className="w-4 h-4" /> },
            ].map(({ label, count, color, icon }) => (
              <div key={label} className={`rounded-2xl border bg-white p-4 flex items-center gap-3 shadow-sm border-${color}-100`}>
                <div className={`w-9 h-9 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 shrink-0`}>
                  {icon}
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${filterStatus === tab
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                }`}
            >
              {capitalize(tab)} <span className={`ml-1 text-xs font-bold ${filterStatus === tab ? "opacity-80" : "text-gray-400"}`}>({tabCount(tab)})</span>
            </button>
          ))}
        </div>

        {/* ── Cards ── */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-xl p-4 sm:p-6 border border-white">
          {loading ? (
            <div className="grid gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center"><ImageOff className="w-6 h-6 text-gray-500" /></div>
              <p className="mt-4 text-gray-700 font-medium">No houses found</p>
              <p className="text-sm text-gray-500">Try a different filter or search keyword.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((h) => {
                const landlord = h.landlordId || {};
                const image = (Array.isArray(h.images) && h.images[0]) || (Array.isArray(h.imageUrls) && h.imageUrls[0]) || h.image || fallbackImg;
                const locationText = h.address || h.location || h.city || "—";
                const verificationStatus = h.verificationStatus || "pending";
                const billUrl = h.electricityBillUrl || "";
                const billType = String(h.electricityBillType || "").toLowerCase();
                const billIsPdf = billType.includes("pdf");
                const isPending = verificationStatus === "pending";
                const actionBusy = actionLoadingId === h._id;

                return (
                  <div key={h._id} className="group rounded-2xl border bg-white p-4 sm:p-5 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="w-full sm:w-52 shrink-0">
                        <div className="relative overflow-hidden rounded-xl border bg-gray-50 h-44 sm:h-full min-h-[120px]">
                          <img src={image} alt={h.title || "House"} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                            onError={(e) => { e.currentTarget.src = fallbackImg; }} loading="lazy" />
                          {Array.isArray(h.images) && h.images.length > 1 && (
                            <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                              +{h.images.length - 1}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{h.title || "House Listing"}</h3>
                              <StatusPill status={verificationStatus} />
                            </div>

                            {/* Location, price, bill, submitted */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Pill><MapPin className="w-3.5 h-3.5 text-indigo-400" /><span className="truncate max-w-[200px]">{locationText}</span></Pill>
                              <Pill><IndianRupee className="w-3.5 h-3.5" /><span className="font-semibold">{h.rent ?? "—"}</span>/mo</Pill>
                              {billUrl && (
                                <a href={billUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                                  title="View electricity bill">
                                  <FileText className="w-3.5 h-3.5" />{billIsPdf ? "Bill (PDF)" : "Bill"}<ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <Pill><CalendarDays className="w-3.5 h-3.5 text-gray-400" />{timeAgo(h.createdAt)}</Pill>
                            </div>

                            {/* Extra specs */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Pill className="text-[11px]"><BedDouble className="w-3 h-3 text-indigo-400" />{h.beds ?? "—"}B</Pill>
                              <Pill className="text-[11px]"><Bath className="w-3 h-3 text-indigo-400" />{h.baths ?? "—"}Ba</Pill>
                              {h.area && <Pill className="text-[11px]"><Maximize2 className="w-3 h-3 text-gray-400" />{h.area} sqft</Pill>}
                              <Pill className="text-[11px]"><Building2 className="w-3 h-3 text-indigo-400" />{capitalize(h.type)}</Pill>
                              <Pill className="text-[11px]">Deposit {fmtINR(h.deposit)}</Pill>
                            </div>
                          </div>

                          {/* Delete */}
                          <button onClick={() => setDeleteTarget({ id: h._id, title: h.title })}
                            className="shrink-0 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>

                        {/* Landlord row */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2"><User2 className="w-4 h-4 text-gray-400" /><span className="truncate">{landlord.name || "—"}</span></div>
                          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="truncate">{landlord.email || "—"}</span></div>
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="truncate">{landlord.phone || "—"}</span></div>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{h.description || "No description provided."}</p>

                        {/* Rejection reason inline */}
                        {verificationStatus === "rejected" && h.rejectReason && (
                          <p className="mt-1.5 text-xs text-rose-600 font-medium">Reason: {h.rejectReason}</p>
                        )}

                        {/* Action Bar */}
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                          {/* View details */}
                          <button onClick={() => setDetailHouse(h)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition text-sm font-medium">
                            <Eye className="w-4 h-4" />View Details
                          </button>

                          {!billUrl && <div className="text-xs text-rose-600 font-medium">⚠ Bill not uploaded</div>}

                          <div className="flex gap-2 sm:ml-auto">
                            <button type="button" disabled={!isPending || actionBusy || !billUrl}
                              onClick={() => handleVerifyInterceptReject(h._id, "approved")}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition ${!isPending || !billUrl ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                              title={!billUrl ? "Bill required to approve" : "Approve house"}>
                              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
                            </button>
                            <button type="button" disabled={!isPending || actionBusy}
                              onClick={() => handleVerifyInterceptReject(h._id, "rejected")}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition ${!isPending ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed" : "border-rose-200 text-rose-700 hover:bg-rose-50"}`}>
                              {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {detailHouse && (
        <DetailModal
          house={detailHouse}
          onClose={() => setDetailHouse(null)}
          onVerify={handleVerifyInterceptReject}
          actionBusy={actionLoadingId === detailHouse._id}
        />
      )}

      {rejectTarget && (
        <RejectModal
          onConfirm={(reason) => handleVerify(rejectTarget, "rejected", reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
