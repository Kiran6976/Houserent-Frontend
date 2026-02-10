import React, { useEffect, useState } from "react";
import {
  Loader2,
  Calendar,
  X,
  MapPin,
  Clock,
  Home,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cancelVisitApi, getMyVisitsApi } from "../services/visitApi";
import { Link } from "react-router-dom";
import { ScheduleVisitModal } from "../components/ScheduleVisitModal";

const API_URL = import.meta.env.VITE_API_URL;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

const StatusPill = ({ status }) => {
  const base = "text-xs px-2.5 py-1 rounded-full font-semibold capitalize border";
  if (status === "pending")
    return <span className={`${base} bg-yellow-50 text-yellow-800 border-yellow-200`}>Pending</span>;
  if (status === "accepted")
    return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Accepted</span>;
  if (status === "rejected")
    return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Rejected</span>;
  if (status === "cancelled")
    return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>Cancelled</span>;
  return <span className={`${base} bg-gray-50 text-gray-700 border-gray-200`}>{status || "Unknown"}</span>;
};

export const MyVisits = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Request-again modal state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState({ id: "", title: "" });

  const load = async (asRefresh = false) => {
    try {
      if (asRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getMyVisitsApi(token);
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } catch (e) {
      console.error(e);
      setVisits([]);
      showToast("Failed to load visits", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (id) => {
    const ok = window.confirm("Cancel this visit request?");
    if (!ok) return;

    try {
      setActionId(id);
      await cancelVisitApi(id, "Cancelled by tenant", token);
      showToast("Visit cancelled", "success");
      await load(true);
    } catch (e) {
      showToast(e.message || "Failed to cancel", "error");
    } finally {
      setActionId(null);
    }
  };

  // ✅ open modal for a specific house
  const openRequestAgain = (houseId, houseTitle) => {
    if (!houseId) {
      showToast("House ID not found.", "error");
      return;
    }
    setSelectedHouse({ id: houseId, title: houseTitle || "Property" });
    setScheduleOpen(true);
  };

  // ✅ submit request again to backend
  const submitRequestAgain = async ({ start, end, message }) => {
    if (!selectedHouse?.id) throw new Error("House ID missing");

    // Optional: extra frontend validation (start < end)
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) {
      showToast("Invalid time slot", "error");
      return;
    }

    const res = await fetch(`${API_URL}/api/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        houseId: selectedHouse.id,
        start,
        end,
        message: message || "",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Failed to request visit");
    }

    showToast("Visit requested ✅", "success");
    await load(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Visits</h1>
              <p className="text-white/85 mt-2">Track your scheduled visits and landlord responses.</p>
            </div>

            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/20 px-4 py-2 font-semibold transition disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visits.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No visit requests</h3>
            <p className="mt-1 text-gray-600">Request a visit from any property details page.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {visits.map((v) => {
              const title = v.houseId?.title || "House";
              const location = v.houseId?.location || "—";
              const img = v.houseId?.images?.[0];
              const houseId = v.houseId?._id || v.houseId?.id;
              const status = v.status;

              const canCancel = ["pending", "accepted"].includes(status);
              const canRequestAgain = status === "rejected"; // ✅ main requirement

              return (
                <div key={v._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-56 h-44 md:h-auto bg-gray-100 relative">
                      {img ? (
                        <img src={img} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <StatusPill status={status} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-lg font-bold text-gray-900 truncate">{title}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="truncate">{location}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {houseId ? (
                            <Link
                              to={`/house/${houseId}`}
                              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
                            >
                              View House
                            </Link>
                          ) : null}

                          {/* ✅ Request again button */}
                          {canRequestAgain ? (
                            <button
                              onClick={() => openRequestAgain(houseId, title)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Request again
                            </button>
                          ) : null}

                          {canCancel ? (
                            <button
                              onClick={() => cancel(v._id)}
                              disabled={actionId === v._id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition disabled:opacity-60"
                            >
                              {actionId === v._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Slot */}
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Requested Slot
                          </div>
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <div>
                              <span className="text-gray-600">Start:</span>{" "}
                              <b>{fmt(v.requestedSlot?.start)}</b>
                            </div>
                            <div>
                              <span className="text-gray-600">End:</span>{" "}
                              <b>{fmt(v.requestedSlot?.end)}</b>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl border p-4 ${
                            status === "accepted"
                              ? "border-green-200 bg-green-50"
                              : status === "rejected"
                              ? "border-red-200 bg-red-50"
                              : status === "cancelled"
                              ? "border-gray-200 bg-gray-50"
                              : "border-yellow-200 bg-yellow-50"
                          }`}
                        >
                          {status === "accepted" && v.finalSlot?.start ? (
                            <>
                              <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmed Slot
                              </div>
                              <div className="mt-2 text-sm text-green-900/90">
                                <b>{fmt(v.finalSlot.start)}</b> → <b>{fmt(v.finalSlot.end)}</b>
                              </div>
                            </>
                          ) : status === "rejected" ? (
                            <>
                              <div className="flex items-center gap-2 text-sm font-semibold text-red-900">
                                <AlertTriangle className="w-4 h-4" />
                                Rejected by landlord
                              </div>
                              <div className="mt-2 text-sm text-red-900/80">
                                Try another time slot using <b>Request again</b>.
                              </div>
                            </>
                          ) : status === "cancelled" ? (
                            <>
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Ban className="w-4 h-4" />
                                Cancelled
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                This visit request was cancelled.
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-900">
                                <Calendar className="w-4 h-4" />
                                Waiting for approval
                              </div>
                              <div className="mt-2 text-sm text-yellow-900/80">
                                Landlord will accept or reject your request.
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {v.landlordNote ? (
                        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
                          <div className="text-sm font-semibold text-gray-900">Landlord Note</div>
                          <div className="mt-1 text-sm text-gray-700">{v.landlordNote}</div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Modal for Request again */}
      <ScheduleVisitModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        houseTitle={selectedHouse?.title}
        onSubmit={submitRequestAgain}
      />
    </div>
  );
};
