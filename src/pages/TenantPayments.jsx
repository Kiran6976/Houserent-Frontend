import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  Loader2,
  Copy,
  RefreshCw,
  Ban,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL;

export const TenantPayments = () => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [house, setHouse] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(true);

  // history
  const [historyLoading, setHistoryLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  // modal + payment
  const [showPayModal, setShowPayModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payData, setPayData] = useState(null); // { paymentId, amount, period, upiLink, payee }

  // proof
  const [utrInput, setUtrInput] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  // UI helpers
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const closeModal = () => {
    setShowPayModal(false);
    setPayData(null);
    setPayLoading(false);
    setUtrInput("");
    setProofUrl("");
    setUploadingProof(false);
    setSubmittingProof(false);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied!", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const fetchHouse = async () => {
    if (!houseId) return;
    setLoadingHouse(true);
    try {
      const res = await fetch(`${API_URL}/api/houses/${houseId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load house");
      setHouse(data);
    } catch (err) {
      showToast(err.message || "Failed to load house", "error");
      setHouse(null);
    } finally {
      setLoadingHouse(false);
    }
  };

  const fetchHistory = async () => {
    if (!token || !houseId) {
      setHistoryLoading(false);
      setPayments([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rent-payments/my/${houseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load payment history");
      setPayments(Array.isArray(data?.payments) ? data.payments : []);
    } catch (err) {
      showToast(err.message || "Failed to load history", "error");
      setPayments([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houseId]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, houseId]);

  const latestStatus = useMemo(() => {
    if (!payments?.length) return null;
    return payments[0]?.status || null;
  }, [payments]);

  // initiate rent payment
  const startRentPayment = async () => {
    if (!token) {
      showToast("Please login again", "error");
      navigate("/login");
      return;
    }
    setShowPayModal(true);
    setPayLoading(true);
    setPayData(null);
    setUtrInput("");
    setProofUrl("");

    try {
      const res = await fetch(`${API_URL}/api/rent-payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ houseId, period: selectedPeriod }),
      });

      const data = await res.json().catch(() => ({}));

      // if already exists for month
      if (!res.ok) {
        if (res.status === 400 && data?.paymentId) {
          showToast(data?.message || "Rent already exists for this month", "info");
          // we can still show history
          closeModal();
          fetchHistory();
          return;
        }
        throw new Error(data?.message || "Failed to initiate payment");
      }

      setPayData({
        paymentId: data.paymentId,
        amount: data.amount,
        period: data.period,
        upiLink: data.upiLink,
        payee: data.payee,
      });

      showToast("Scan QR / open UPI and then submit UTR", "info");
    } catch (err) {
      showToast(err.message || "Failed to start rent payment", "error");
      closeModal();
    } finally {
      setPayLoading(false);
    }
  };

  // upload screenshot via your backend upload api (same as booking)
  const uploadProofImage = async (file) => {
    if (!file) return;
    if (!token) {
      showToast("Please login again", "error");
      return;
    }

    setUploadingProof(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_URL}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      if (!data?.url) throw new Error("Upload failed: URL missing");

      setProofUrl(data.url);
      showToast("Screenshot uploaded ✅", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
      setProofUrl("");
    } finally {
      setUploadingProof(false);
    }
  };

  // submit payment proof
  const submitRentProof = async () => {
    if (!payData?.paymentId) return;

    const utr = String(utrInput || "").trim();
    if (!utr) {
      showToast("UTR / Transaction ID is required", "error");
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await fetch(`${API_URL}/api/rent-payments/${payData.paymentId}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utr, proofUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit proof");

      showToast("Payment submitted ✅ Landlord will verify.", "success");
      closeModal();
      fetchHistory();
    } catch (err) {
      showToast(err.message || "Failed to submit proof", "error");
    } finally {
      setSubmittingProof(false);
    }
  };

  const statusPill = (s) => {
    const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
    if (!s) return <span className={`${base} bg-gray-100 text-gray-700`}>NO PAYMENTS</span>;
    if (s === "approved") return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle2 className="w-4 h-4" /> APPROVED</span>;
    if (s === "payment_submitted") return <span className={`${base} bg-blue-100 text-blue-700`}>SUBMITTED</span>;
    if (s === "initiated") return <span className={`${base} bg-yellow-100 text-yellow-700`}>INITIATED</span>;
    if (s === "rejected") return <span className={`${base} bg-red-100 text-red-700`}><XCircle className="w-4 h-4" /> REJECTED</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{String(s).toUpperCase()}</span>;
  };

  if (loadingHouse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-xl font-bold text-gray-900">House not found</div>
          <p className="text-gray-600 mt-2">This property was removed or not accessible.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const rent = Number(house?.rent || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
              <p className="text-white/80 mt-1">{house.title} • ₹{rent.toLocaleString("en-IN")}/month</p>
            </div>

            <div className="flex items-center gap-3">
              {statusPill(latestStatus)}
              <button
                onClick={fetchHistory}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white/10 rounded-xl p-4 text-sm text-white/90">
            Pay rent via UPI → submit UTR → landlord approves → it gets added to history.
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pay card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900">Pay Monthly Rent</h2>
          <p className="text-sm text-gray-600 mt-1">Select month and pay ₹{rent.toLocaleString("en-IN")}.</p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">One payment per month is allowed.</p>
          </div>

          <button
            onClick={startRentPayment}
            disabled={!rent || rent <= 0}
            className={`mt-4 w-full py-3 rounded-xl font-medium transition ${
              rent > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Pay Rent via UPI
          </button>

          <p className="mt-3 text-xs text-gray-500">
            If landlord’s UPI is not set, you’ll see an error — landlord must add UPI in dashboard.
          </p>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>

          {historyLoading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : payments.length ? (
            <div className="mt-4 divide-y">
              {payments.map((p) => (
                <div key={p._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {p.period || "-"} • ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                      <span className="ml-1">{statusPill(p.status)}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 break-all">
                      UTR: {p.tenantUtr ? <b>{p.tenantUtr}</b> : <span className="text-gray-400">—</span>}
                    </div>
                    {p.paymentProofUrl ? (
                      <a
                        href={p.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mt-2"
                      >
                        <ImageIcon className="w-4 h-4" /> View Screenshot
                      </a>
                    ) : null}
                  </div>

                  <div className="text-sm text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-600">
              No rent payments yet.
            </div>
          )}
        </div>
      </div>

      {/* ✅ Responsive Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

          <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="
                w-full sm:max-w-md
                bg-white
                rounded-t-2xl sm:rounded-2xl
                shadow-2xl
                max-h-[92vh] sm:max-h-[90vh]
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pay Rent</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Month: <b>{selectedPeriod}</b> • Amount: <b>₹{rent.toLocaleString("en-IN")}</b>
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="shrink-0 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(92vh-72px)] sm:max-h-[calc(90vh-72px)]">
                {payLoading ? (
                  <div className="py-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : payData ? (
                  <>
                    {/* Summary */}
                    <div className="rounded-xl border p-4 bg-gray-50">
                      <div className="text-sm text-gray-600">Pay To</div>
                      <div className="font-semibold text-gray-900 break-all">
                        {payData?.payee?.name || "Landlord"} • {payData?.payee?.upiId || "UPI"}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        ₹{Number(payData.amount || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 break-all">
                        Payment ID: <b>{payData.paymentId}</b>
                      </div>
                    </div>

                    {/* QR */}
                    <div className="mt-4 flex justify-center">
                      <div className="rounded-xl border p-3 bg-white">
                        <QRCodeCanvas
                          value={payData.upiLink}
                          size={Math.min(240, window.innerWidth - 140)}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => copyText(payData.upiLink)}
                        className="w-full py-2.5 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy UPI Link
                      </button>

                      <button
                        onClick={() => (window.location.href = payData.upiLink)}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
                      >
                        Open UPI App
                      </button>
                    </div>

                    {/* After Payment */}
                    <div className="mt-5 rounded-xl border p-4">
                      <div className="font-semibold text-gray-900">After Payment</div>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter UTR/Transaction ID and optionally upload screenshot.
                      </p>

                      <input
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value)}
                        placeholder="UTR / Transaction ID"
                        className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                          <UploadCloud className="w-4 h-4" />
                          {uploadingProof ? "Uploading..." : "Upload Screenshot"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadProofImage(e.target.files?.[0])}
                            disabled={uploadingProof}
                          />
                        </label>

                        {proofUrl ? (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition"
                          >
                            <ImageIcon className="w-4 h-4" />
                            View
                          </a>
                        ) : null}
                      </div>

                      <button
                        onClick={submitRentProof}
                        disabled={submittingProof}
                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {submittingProof ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {submittingProof ? "Submitting..." : "Submit Payment Proof"}
                      </button>

                      <p className="mt-2 text-xs text-gray-500">
                        Landlord will verify and approve after receiving the rent.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-red-600">Payment details not available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
