import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { HouseCard } from "../components/HouseCard";
import { Plus, Home, Mail, MapPin, Loader2, Building, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const LandlordDashboard = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Razorpay payout setup
  const [creatingAccount, setCreatingAccount] = useState(false);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchMyHouses = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/houses/my`, { headers: authHeaders });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || "Failed to load houses");
      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = String(err.message || "").toLowerCase();
      showToast(err.message || "Failed to load houses", "error");
      if (msg.includes("unauthorized") || msg.includes("jwt") || msg.includes("token")) {
        logout?.();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleEdit = (houseId) => {
    navigate(`/landlord/edit-house/${houseId}`);
  };

  const handleDelete = (houseId) => {
    setDeleteConfirm(houseId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/houses/${deleteConfirm}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setHouses((prev) => prev.filter((h) => (h._id || h.id) !== deleteConfirm));
      showToast("House deleted successfully", "success");
      setDeleteConfirm(null);
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Create Razorpay linked account
  const createLinkedAccount = async () => {
    if (!token) return showToast("Please login again", "error");

    // strongly recommend phone for linked account
    if (!user?.phone) {
      return showToast("Please add your phone number in profile first (required for payout setup)", "error");
    }

    setCreatingAccount(true);
    try {
      const res = await fetch(`${API_URL}/api/route/landlord/create-linked-account`, {
        method: "POST",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create payout account");

      // ✅ Update local auth user instantly
      updateUser?.({
        ...user,
        razorpayAccountId: data.razorpayAccountId || user?.razorpayAccountId,
        razorpayAccountStatus: data.razorpayAccountStatus || "created",
        razorpayRequirements: data.requirements || {},
      });

      showToast("Payout account created ✅ Next: complete KYC (we'll add form next)", "success");
    } catch (err) {
      showToast(err.message || "Failed to create payout account", "error");
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const totalRent = houses.reduce((sum, h) => sum + Number(h.rent || 0), 0);

  const payoutStatus = user?.razorpayAccountStatus || "not_created";
  const isActivated = payoutStatus === "activated";

  const statusPill = () => {
    const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
    if (payoutStatus === "activated") {
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          <CheckCircle2 className="w-4 h-4" /> ACTIVATED
        </span>
      );
    }
    if (payoutStatus === "created" || payoutStatus === "pending") {
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          <AlertTriangle className="w-4 h-4" /> PENDING KYC
        </span>
      );
    }
    return (
      <span className={`${base} bg-gray-100 text-gray-700`}>
        <AlertTriangle className="w-4 h-4" /> NOT SETUP
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user?.address}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{houses.length}</div>
                <div className="text-white/80 text-sm">Properties</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">₹{totalRent.toLocaleString("en-IN")}</div>
                <div className="text-white/80 text-sm">Monthly Revenue</div>
              </div>
            </div>
          </div>

          {/* ✅ PAYOUT SETUP SECTION */}
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">Payout Setup (Razorpay Route)</div>
                    <p className="text-white/80 text-sm mt-1">
                      Tenants can pay booking amount only after your payout account is setup.
                    </p>
                  </div>
                  {statusPill()}
                </div>

                <div className="mt-3">
                  {user?.razorpayAccountId ? (
                    <div className="text-sm text-white/90">
                      Linked Account ID: <span className="font-semibold">{user.razorpayAccountId}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-100">
                      ⚠️ Payout account not created yet. Create it to start receiving payments.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={createLinkedAccount}
                    disabled={creatingAccount || !!user?.razorpayAccountId}
                    className="px-5 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition disabled:opacity-60"
                  >
                    {creatingAccount
                      ? "Creating..."
                      : user?.razorpayAccountId
                      ? "Account Created"
                      : "Create Payout Account"}
                  </button>

                  {!isActivated && user?.razorpayAccountId && (
                    <button
                      onClick={() =>
                        showToast("Next step: we will add KYC + bank details form here", "info")
                      }
                      className="px-5 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition"
                    >
                      Complete KYC (Next)
                    </button>
                  )}
                </div>

                {!isActivated && user?.razorpayRequirements && Object.keys(user.razorpayRequirements).length > 0 && (
                  <div className="mt-3 text-xs text-white/80">
                    Razorpay Requirements: {JSON.stringify(user.razorpayRequirements)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
            <p className="text-gray-600">Manage your rental listings</p>
          </div>
          <Link
            to="/landlord/add-house"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </Link>
        </div>

        {/* Houses Grid */}
        {houses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => {
              const houseId = house._id || house.id;
              return (
                <HouseCard
                  key={houseId}
                  house={house}
                  showActions
                  onEdit={() => handleEdit(houseId)}
                  onDelete={() => handleDelete(houseId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first rental property</p>
            <Link
              to="/landlord/add-house"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              <Home className="w-5 h-5" />
              Add Your First Property
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Property?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
