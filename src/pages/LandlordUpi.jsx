import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { CreditCard, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const LandlordUpi = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [upiId, setUpiId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // if you store upiId in user later, show it here
    if (user?.upiId) setUpiId(user.upiId);
  }, [user?.upiId]);

  const save = async () => {
    if (!upiId.trim()) return showToast("UPI ID is required", "error");
    if (!upiId.includes("@")) return showToast("Invalid UPI ID (example: name@bank)", "error");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/landlord/upi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ upiId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(data?.message || "Failed to save UPI ID", "error");

      showToast("UPI ID saved successfully", "success");
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Payment Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Add your UPI ID to receive booking payments.
        </p>

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="example: kiransamanta@okicici"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save UPI ID"
          )}
        </button>
      </div>
    </div>
  );
};
