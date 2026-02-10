import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { landlordGetTenants, landlordVacateHouse } from "../services/landlordApi";
import { ArrowLeft, Home, Loader2, Users, Phone, Mail, MapPin, UserCheck } from "lucide-react";

export const LandlordTenants = () => {
  const { token, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingHouseId, setProcessingHouseId] = useState(null);

  const fetchTenants = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await landlordGetTenants(token);
      setRows(Array.isArray(data?.tenants) ? data.tenants : []);
    } catch (e) {
      showToast(e.message || "Failed to load tenants", "error");
      if (e?.statusCode === 401) {
        logout?.();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const vacate = async (houseId) => {
    const ok = window.confirm("Mark this tenant as LEFT and make the house available again?");
    if (!ok) return;

    setProcessingHouseId(houseId);
    try {
      await landlordVacateHouse(houseId, token);
      showToast("House is now available ✅", "success");
      fetchTenants();
    } catch (e) {
      showToast(e.message || "Vacate failed", "error");
    } finally {
      setProcessingHouseId(null);
    }
  };

  const total = rows.length;

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
    
    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
        <Users className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Users / Tenants</h1>
        <p className="text-white/80">See which tenant owns which house</p>
        <p className="text-white/80 text-sm mt-1">{total} active tenants</p>
      </div>
    </div>

    {/* RIGHT SIDE ACTIONS */}
    <div className="flex items-center gap-3">
      <Link
        to="/landlord/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <Link
        to="/landlord/rent-payments"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/20 border border-white/20 transition"
      >
        Rent Payments
      </Link>
    </div>
  </div>
</div>

        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tenants yet</h3>
            <p className="text-gray-600">Once a booking is approved, tenant will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rows.map((row) => {
              const house = row.house;
              const tenant = row.tenant;
              const booking = row.booking;

              const houseId = house?.id;
              const disabled = processingHouseId === houseId;

              return (
                <div key={houseId} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* House header */}
                  <div className="p-5 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-bold text-gray-900 truncate">{house?.title || "House"}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          <span className="truncate">{house?.location || "N/A"}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Rent</div>
                        <div className="font-bold text-gray-900">₹{Number(house?.rent || 0).toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <b>Booking:</b> ₹{Number(booking?.amount || 0).toLocaleString("en-IN")} • <b>Status:</b>{" "}
                      <span className="font-semibold">{String(booking?.status || "N/A").toUpperCase()}</span>
                    </div>

                    {house?.rentedAt && (
                      <div className="mt-1 text-xs text-gray-500">
                        Rented at: {new Date(house.rentedAt).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>

                  {/* Tenant */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {tenant?.name?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{tenant?.name || "Tenant"}</div>
                        <div className="text-sm text-gray-600 truncate">{tenant?.address || ""}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tenant?.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                      )}
                      {tenant?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-4 h-4 text-indigo-600" />
                          <span className="truncate">{tenant.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => vacate(houseId)}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                      >
                        {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                        Mark Left (Vacate)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
};
