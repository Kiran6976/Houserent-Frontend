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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ HEADER / HERO (kept, just upgraded background like your other pages) */}
      <div className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_20%,white,transparent_45%),radial-gradient(circle_at_50%_80%,white,transparent_50%)]" />
        <div className="absolute -top-24 -left-28 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl animate-floatH1" />
        <div className="absolute top-8 -right-40 h-[560px] w-[560px] rounded-full bg-white/10 blur-3xl animate-floatH2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                My{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                  Rents
                </span>
              </h1>
              <p className="text-white/85 mt-2 text-lg max-w-2xl">{subtitle}</p>
            </div>

            <button
              onClick={load}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition shadow-lg shadow-black/10"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* ✅ Flow help (glass) */}
          <div className="mt-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-5 shadow-2xl shadow-black/15">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>

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

        {/* hero animations */}
        <style>{`
          @keyframes floatH1 { 0%{transform:translate(0,0)} 50%{transform:translate(18px,10px)} 100%{transform:translate(0,0)} }
          @keyframes floatH2 { 0%{transform:translate(0,0)} 50%{transform:translate(-14px,12px)} 100%{transform:translate(0,0)} }
          .animate-floatH1{animation:floatH1 12s ease-in-out infinite;}
          .animate-floatH2{animation:floatH2 14s ease-in-out infinite;}
          @keyframes floatBgA { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,12px) scale(1.05)} 100%{transform:translate(0,0) scale(1)} }
          @keyframes floatBgB { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-14px,10px) scale(1.06)} 100%{transform:translate(0,0) scale(1)} }
          .animate-floatBgA{animation:floatBgA 18s ease-in-out infinite;}
          .animate-floatBgB{animation:floatBgB 22s ease-in-out infinite;}
        `}</style>
      </div>

      {/* ✅ CONTENT AREA (fix plain white bg here) */}
      <section className="relative overflow-hidden">
        {/* background wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/60 to-white" />
        {/* subtle dots */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#111827_1px,transparent_1px)] [background-size:18px_18px]" />
        {/* soft blobs */}
        <div className="absolute -top-28 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-3xl animate-floatBgA" />
        <div className="absolute top-10 -right-44 h-[560px] w-[560px] rounded-full bg-purple-300/20 blur-3xl animate-floatBgB" />
        <div className="absolute -bottom-44 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-fuchsia-300/20 blur-3xl animate-floatBgA" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* ✅ small summary bar */}
          <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 backdrop-blur px-4 py-2 shadow-sm">
            <span className="text-gray-700">
              Approved rentals: <b>{houses.length}</b>
            </span>
            <span className="h-4 w-px bg-gray-300/70" />
            <button
              onClick={load}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Refresh
            </button>
          </div>

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
            <div className="bg-white/85 backdrop-blur rounded-3xl p-12 text-center border border-white/70 shadow-sm">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Home className="w-10 h-10 text-gray-400" />
              </div>

              {!token ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Please login</h3>
                  <p className="text-gray-600">Login to see your approved rentals.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No approved rents yet</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    If you already paid, go to the house details → submit UTR (payment proof). After admin approves, it
                    will appear here.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-50 text-indigo-800 px-4 py-2 text-sm font-semibold border border-indigo-100">
                    Tip: Open a house → Pay → Submit UTR
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
