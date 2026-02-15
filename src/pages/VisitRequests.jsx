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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
    {/* Soft glow blobs */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-200/40 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-200/40 blur-3xl rounded-full" />
    </div>

    {/* Hero */}
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700" />
      <div className="relative py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-end justify-between gap-4">

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Visit Requests
            </h1>
            <p className="mt-2 text-white/80">
              Accept or reject tenant visit requests.
            </p>
          </div>

          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur px-5 py-2.5 font-semibold hover:bg-white/25 transition disabled:opacity-60"
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
    </div>

    {/* Content Surface */}
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur shadow-lg shadow-indigo-100/40 p-6">

        {visits.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-900">
              No requests
            </h3>
            <p className="mt-1 text-slate-600">
              New visit requests will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {visits.map((v) => {
              const title = v.houseId?.title || "House";
              const location = v.houseId?.location || "—";
              const img = v.houseId?.images?.[0];
              const status = v.status;

              return (
                <div
                  key={v._id}
                  className="group rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">

                    {/* Image */}
                    <div className="md:w-56 h-44 md:h-auto bg-slate-100 relative">
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">
                            {title}
                          </h2>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            {location}
                          </div>
                        </div>

                        {status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => accept(v._id)}
                              disabled={actionId === v._id}
                              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-2.5 font-semibold hover:bg-emerald-700 transition shadow"
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
                              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 text-white px-5 py-2.5 font-semibold hover:bg-rose-700 transition shadow"
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

                      {/* Tenant Box */}
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Tenant Details
                          </div>
                          <div className="mt-2 text-sm text-slate-600 space-y-1">
                            <div className="font-semibold text-slate-800">
                              {v.tenantId?.name}
                            </div>
                            <div>{v.tenantId?.email}</div>
                            <div>{v.tenantId?.phone}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Requested Slot
                          </div>
                          <div className="mt-2 text-sm text-slate-700">
                            <b>{fmt(v.requestedSlot?.start)}</b> →{" "}
                            <b>{fmt(v.requestedSlot?.end)}</b>
                          </div>
                        </div>
                      </div>

                      {v.tenantMessage && (
                        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                          <div className="text-sm font-semibold text-indigo-900">
                            Tenant Message
                          </div>
                          <div className="mt-1 text-sm text-indigo-900/80">
                            {v.tenantMessage}
                          </div>
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
  </div>
);
};