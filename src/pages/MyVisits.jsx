import React, { useEffect, useState } from "react";
import { Loader2, Calendar, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cancelVisitApi, getMyVisitsApi } from "../services/visitApi";
import { Link } from "react-router-dom";

const fmt = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export const MyVisits = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyVisitsApi(token);
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } catch (e) {
      console.error(e);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (id) => {
    try {
      await cancelVisitApi(id, "Cancelled by tenant", token);
      showToast("Visit cancelled", "success");
      load();
    } catch (e) {
      showToast(e.message || "Failed to cancel", "error");
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Visits</h1>
          <p className="text-white/80 mt-2">Track your scheduled visits and landlord responses.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {visits.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="mt-3 text-xl font-semibold text-gray-900">No visit requests</h3>
            <p className="mt-1 text-gray-600">Request a visit from any property details page.</p>
          </div>
        ) : (
          visits.map((v) => (
            <div key={v._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{v.houseId?.title || "House"}</div>
                  <div className="text-sm text-gray-600">{v.houseId?.location || "—"}</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Requested: <b>{fmt(v.requestedSlot?.start)}</b> → <b>{fmt(v.requestedSlot?.end)}</b>
                  </div>
                  {v.status === "accepted" && v.finalSlot?.start && (
                    <div className="mt-1 text-sm text-green-700">
                      Confirmed: <b>{fmt(v.finalSlot.start)}</b> → <b>{fmt(v.finalSlot.end)}</b>
                    </div>
                  )}
                  {v.landlordNote ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Note: <span className="text-gray-600">{v.landlordNote}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      v.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : v.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : v.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {v.status}
                  </span>

                  <Link
                    to={`/house/${v.houseId?._id || v.houseId?.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    View House
                  </Link>

                  {["pending", "accepted"].includes(v.status) && (
                    <button
                      onClick={() => cancel(v._id)}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
