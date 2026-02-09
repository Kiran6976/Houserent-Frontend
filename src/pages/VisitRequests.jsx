import React, { useEffect, useState } from "react";
import {
  Loader2,
  Check,
  X,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  RefreshCw,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { acceptVisitApi, getLandlordVisitsApi, rejectVisitApi } from "../services/visitApi";

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

export const VisitRequests = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [actionId, setActionId] = useState(null); // for button loading
  const [refreshing, setRefreshing] = useState(false);

  const load = async (asRefresh = false) => {
    try {
      if (asRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getLandlordVisitsApi(token);
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } catch (e) {
      console.error(e);
      setVisits([]);
      showToast("Failed to load visit requests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = async (id) => {
    try {
      setActionId(id);
      await acceptVisitApi(id, { note: "Confirmed. Please arrive on time." }, token);
      showToast("Visit accepted", "success");
      await load(true);
    } catch (e) {
      showToast(e.message || "Failed to accept", "error");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    try {
      setActionId(id);
      await rejectVisitApi(id, "Not available at that time.", token);
      showToast("Visit rejected", "success");
      await load(true);
    } catch (e) {
      showToast(e.message || "Failed to reject", "error");
    } finally {
      setActionId(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Visit Requests</h1>
              <p className="text-white/85 mt-2">Accept or reject tenant visit requests.</p>
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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No requests</h3>
            <p className="mt-1 text-gray-600">New visit requests will show up here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {visits.map((v) => {
              const title = v.houseId?.title || "House";
              const location = v.houseId?.location || "—";
              const img = v.houseId?.images?.[0];
              const status = v.status;

              return (
                <div
                  key={v._id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Card header with image */}
                  <div className="flex flex-col md:flex-row">
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

                    <div className="flex-1 p-5">
                      {/* Top row */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-lg font-bold text-gray-900 truncate">{title}</div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="truncate">{location}</span>
                          </div>
                        </div>

                        {status === "pending" && (
                          <div className="flex gap-2 md:justify-end">
                            <button
                              onClick={() => accept(v._id)}
                              disabled={actionId === v._id}
                              className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2.5 font-semibold hover:bg-green-700 transition disabled:opacity-60"
                            >
                              {actionId === v._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </button>

                            <button
                              onClick={() => reject(v._id)}
                              disabled={actionId === v._id}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2.5 font-semibold hover:bg-red-700 transition disabled:opacity-60"
                            >
                              {actionId === v._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info grid */}
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Tenant box */}
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <User className="w-4 h-4 text-indigo-600" />
                            Tenant Details
                          </div>

                          <div className="mt-2 text-sm text-gray-700">
                            <div className="font-semibold">{v.tenantId?.name || "Tenant"}</div>

                            <div className="mt-2 space-y-1.5 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="break-all">{v.tenantId?.email || "—"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{v.tenantId?.phone || "—"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Slot box */}
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

                            {v.finalSlot?.start && v.status === "accepted" && (
                              <div className="pt-2 mt-2 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-700">Final Slot (Confirmed)</div>
                                <div className="mt-1 text-sm text-gray-700">
                                  <b>{fmt(v.finalSlot.start)}</b> → <b>{fmt(v.finalSlot.end)}</b>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {v.tenantMessage ? (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                          <div className="text-sm font-semibold text-indigo-900">Tenant Message</div>
                          <div className="mt-1 text-sm text-indigo-900/80">{v.tenantMessage}</div>
                        </div>
                      ) : null}

                      {/* Notes after accept/reject */}
                      {v.landlordNote ? (
                        <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4">
                          <div className="text-sm font-semibold text-gray-900">Your Note</div>
                          <div className="mt-1 text-sm text-gray-700">{v.landlordNote}</div>
                        </div>
                      ) : null}

                      {/* Footer (for non-pending statuses) */}
                      {status !== "pending" && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <StatusPill status={status} />
                          <span className="text-xs text-gray-500">
                            Updated recently
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
