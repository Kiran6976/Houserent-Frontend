// src/pages/MyVisits.jsx (UPDATED AGAIN)
// ✅ Fix: subtitle hidden by wave (pb + z-index)
// ✅ Keeps: gradients + cards + background

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
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
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

  const openRequestAgain = (houseId, houseTitle) => {
    if (!houseId) {
      showToast("House ID not found.", "error");
      return;
    }
    setSelectedHouse({ id: houseId, title: houseTitle || "Property" });
    setScheduleOpen(true);
  };

  const submitRequestAgain = async ({ start, end, message }) => {
    if (!selectedHouse?.id) throw new Error("House ID missing");

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
    if (!res.ok) throw new Error(data?.message || "Failed to request visit");

    showToast("Visit requested ✅", "success");
    await load(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ PAGE BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-indigo-50/60 to-white" />
      <div className="absolute inset-0 -z-10 opacity-[0.06] bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -z-10 -top-24 -left-24 h-80 w-80 rounded-full bg-purple-200/35 blur-3xl" />
      <div className="absolute -z-10 top-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="absolute -z-10 bottom-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      {/* ✅ HERO */}
      <div className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_20%,white,transparent_45%),radial-gradient(circle_at_50%_80%,white,transparent_50%)]" />
        <div className="absolute -top-24 -left-28 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl animate-floatV1" />
        <div className="absolute top-10 -right-36 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl animate-floatV2" />

        {/* ✅ IMPORTANT: extra bottom padding so wave never overlaps text */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-sm">
                <Calendar className="w-4 h-4" />
                Visits • Requests & responses
              </div>

              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.25)]">
                My{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                  Visits
                </span>
              </h1>

              {/* ✅ Stronger contrast + shadow */}
              <p className="mt-2 text-lg text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                Track your scheduled visits and landlord responses.
              </p>
            </div>

            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 border border-white/20 hover:bg-white/20 px-5 py-3 font-semibold transition disabled:opacity-60 backdrop-blur"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ Wave MUST be behind text */}
        <div className="absolute bottom-0 left-0 right-0 -z-10 pointer-events-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z"
              fill="white"
              opacity="0.88"
            />
          </svg>
        </div>

        <style>{`
          @keyframes floatV1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(18px,10px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
          @keyframes floatV2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-14px,12px) scale(1.05)} 100%{transform:translate(0,0) scale(1)} }
          .animate-floatV1{animation:floatV1 12s ease-in-out infinite;}
          .animate-floatV2{animation:floatV2 14s ease-in-out infinite;}
        `}</style>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visits.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-10 text-center shadow-sm border border-gray-100">
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
              const canRequestAgain = status === "rejected";

              return (
                <div
                  key={v._id}
                  className="group relative bg-white/85 backdrop-blur rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-56 h-44 md:h-auto bg-gray-100 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <StatusPill status={status} />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-lg font-extrabold text-gray-900 truncate">{title}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="truncate">{location}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {houseId ? (
                            <Link
                              to={`/house/${houseId}`}
                              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
                            >
                              View House
                            </Link>
                          ) : null}

                          {canRequestAgain ? (
                            <button
                              onClick={() => openRequestAgain(houseId, title)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Request again
                            </button>
                          ) : null}

                          {canCancel ? (
                            <button
                              onClick={() => cancel(v._id)}
                              disabled={actionId === v._id}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition disabled:opacity-60"
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

                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Requested Slot
                          </div>
                          <div className="mt-2 text-sm text-gray-700 space-y-1">
                            <div>
                              <span className="text-gray-600">Start:</span> <b>{fmt(v.requestedSlot?.start)}</b>
                            </div>
                            <div>
                              <span className="text-gray-600">End:</span> <b>{fmt(v.requestedSlot?.end)}</b>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl border p-4 ${
                            status === "accepted"
                              ? "border-green-200 bg-green-50/80"
                              : status === "rejected"
                              ? "border-red-200 bg-red-50/80"
                              : status === "cancelled"
                              ? "border-gray-200 bg-gray-50"
                              : "border-yellow-200 bg-yellow-50/80"
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
                              <div className="mt-2 text-sm text-gray-700">This visit request was cancelled.</div>
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

      <ScheduleVisitModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        houseTitle={selectedHouse?.title}
        onSubmit={submitRequestAgain}
      />
    </div>
  );
};
