import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Home, RefreshCw, Info } from "lucide-react";
import { HouseCard } from "../components/HouseCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getMyRentsApi } from "../services/tenantApi";

export const MyRents = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [houses, setHouses] = useState([]);

  const load = async () => {
    if (!token) {
      setLoading(false);
      setHouses([]);
      return;
    }

    try {
      setLoading(true);

      const data = await getMyRentsApi(token);
      setHouses(Array.isArray(data?.houses) ? data.houses : []);
    } catch (e) {
      console.error(e);
      showToast(e.message || "Failed to load My Rents", "error");
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const subtitle = useMemo(() => {
    return "After you pay the booking amount, submit UTR. Admin verifies → approves → then it appears here.";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Rents</h1>
              <p className="text-white/80 mt-2">{subtitle}</p>
            </div>

            <button
              onClick={load}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Flow help */}
          <div className="mt-4 bg-white/10 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5" />
            <div className="text-sm text-white/90">
              <div className="font-semibold">Status Flow</div>
              <div className="mt-1 text-white/80">
                <b>payment_submitted</b> → waiting admin verification • <b>approved</b> → confirmed booking •{" "}
                <b>transferred</b> → payout done (optional)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {houses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <HouseCard
                key={house._id || house.id}
                house={house}
                ctaLabel="Pay Rent"
                ctaTo={`/tenant/payments/${house._id || house.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>

            {!token ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Please login</h3>
                <p className="text-gray-600">Login to see your approved rentals.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No approved rents yet</h3>
                <p className="text-gray-600">
                  If you already paid, go to the house details → submit UTR (payment proof). After admin approves, it will
                  appear here.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
