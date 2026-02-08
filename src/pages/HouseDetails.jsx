import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Shield,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
  Check,
  CreditCard,
  Copy,
  RefreshCw,
  XCircle,
  Ban,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // ✅ Booking modal states (UPI flow)
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payData, setPayData] = useState(null);

  // ✅ if backend says "active booking exists" we store it here to cancel
  const [activeBooking, setActiveBooking] = useState(null); // { bookingId, message }
  const [cancelLoading, setCancelLoading] = useState(false);

  // ✅ Booking status polling
  const [bookingStatus, setBookingStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const pollRef = useRef(null);

  const landlord = useMemo(() => {
    return house?.landlordId && typeof house.landlordId === "object" ? house.landlordId : null;
  }, [house]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/houses/${id}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) throw new Error(data?.message || "Failed to load property");

        setHouse(data);
        setCurrentImageIndex(0);
      } catch (err) {
        showToast(err.message || "Failed to load property", "error");
        setHouse(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const nextImage = () => {
    if (house?.images?.length) setCurrentImageIndex((prev) => (prev + 1) % house.images.length);
  };

  const prevImage = () => {
    if (house?.images?.length)
      setCurrentImageIndex((prev) => (prev - 1 + house.images.length) % house.images.length);
  };

  const handleContact = () => {
    if (!user) {
      showToast("Please login to contact the landlord", "info");
      navigate("/login");
      return;
    }
    setShowContactModal(true);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied!", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    stopPolling();
    setPayData(null);
    setBookingStatus(null);
    setActiveBooking(null);
    setPayLoading(false);
    setCheckingStatus(false);
  };

  const pollBookingStatus = (bookingId) => {
    stopPolling();
    setBookingStatus("checking");

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        const status = data?.status;
        if (status) setBookingStatus(status);

        if (status === "transferred") {
          stopPolling();
          showToast("Booking confirmed ✅ Amount transferred!", "success");
        }
        if (status === "failed" || status === "expired") {
          stopPolling();
          showToast("Payment failed/expired. Please try again.", "error");
        }
        if (status === "cancelled") {
          stopPolling();
          showToast("Booking cancelled.", "info");
        }
      } catch {
        // ignore
      }
    }, 3500);
  };

  const manualCheckStatus = async () => {
    if (!payData?.bookingId) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${payData.bookingId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to check status");

      setBookingStatus(data.status || null);

      if (data.status === "transferred") {
        showToast("Booking confirmed ✅ Amount transferred!", "success");
      } else {
        showToast(`Current status: ${data.status}`, "info");
      }
    } catch (err) {
      showToast(err.message || "Failed to check status", "error");
    } finally {
      setCheckingStatus(false);
    }
  };

  const markAsPaid = async () => {
    if (!payData?.bookingId) return;

    try {
      const utr = window.prompt("Enter UTR / Transaction ID (optional):") || "";
      const res = await fetch(`${API_URL}/api/bookings/${payData.bookingId}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utr }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to mark paid");

      setBookingStatus("paid");
      showToast("Marked as PAID ✅ Admin will verify & transfer to landlord.", "success");
    } catch (err) {
      showToast(err.message || "Failed to mark paid", "error");
    }
  };

  // ✅ Cancel booking (for invisible/stuck booking)
  const cancelBooking = async () => {
    const bookingId = activeBooking?.bookingId || payData?.bookingId;
    if (!bookingId) {
      showToast("Booking ID not found to cancel.", "error");
      return;
    }

    const ok = window.confirm("Cancel this booking? You can book again after cancelling.");
    if (!ok) return;

    setCancelLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to cancel booking");

      showToast("Booking cancelled ✅ You can book again now.", "success");

      // clear modal state
      setActiveBooking(null);
      setPayData(null);
      setBookingStatus("cancelled");
      stopPolling();

      // close modal after short moment (optional)
      closeBookingModal();
    } catch (err) {
      showToast(err.message || "Failed to cancel booking", "error");
    } finally {
      setCancelLoading(false);
    }
  };

  // ✅ Book Now (UPI link + QR)
  const handleBookNow = async () => {
    if (!user || !token) {
      showToast("Please login to book this property", "info");
      navigate("/login");
      return;
    }

    setShowBookingModal(true);
    setPayLoading(true);
    setPayData(null);
    setActiveBooking(null);
    setBookingStatus(null);
    stopPolling();

    try {
      const res = await fetch(`${API_URL}/api/bookings/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ houseId: id }),
      });

      const data = await res.json().catch(() => ({}));

      // ✅ Handle active booking case (backend should send bookingId)
      if (!res.ok) {
        if (res.status === 400 && data?.bookingId) {
          setActiveBooking({ bookingId: data.bookingId, message: data?.message || "Active booking exists." });
          showToast(data?.message || "Active booking exists. You can cancel it.", "info");
          return; // keep modal open with cancel button
        }

        throw new Error(data?.message || "Failed to create booking");
      }

      setPayData({
        bookingId: data.bookingId,
        amount: data.amount,
        upiLink: data.upiLink,
        payee: data.payee,
      });

      if (data?.bookingId) pollBookingStatus(data.bookingId);

      showToast("Scan QR / open UPI to pay booking amount", "info");
    } catch (err) {
      showToast(err.message || "Failed to start payment", "error");
      closeBookingModal();
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/tenant/houses"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const typeLabels = { apartment: "Apartment", room: "Room", house: "House" };
  const furnishedLabels = { unfurnished: "Unfurnished", semi: "Semi-Furnished", fully: "Fully Furnished" };

  const images = Array.isArray(house.images) ? house.images : [];
  const mainImage = images[currentImageIndex] || "https://via.placeholder.com/800x600?text=No+Image";
  const bookingAmount = Number(house.bookingAmount || 0);

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    if (!status) return null;

    if (status === "transferred") return <span className={`${base} bg-green-100 text-green-700`}>TRANSFERRED</span>;
    if (status === "approved") return <span className={`${base} bg-indigo-100 text-indigo-700`}>APPROVED</span>;
    if (status === "paid") return <span className={`${base} bg-blue-100 text-blue-700`}>PAID (ADMIN VERIFY)</span>;
    if (status === "created") return <span className={`${base} bg-yellow-100 text-yellow-700`}>AWAITING PAYMENT</span>;
    if (status === "failed") return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    if (status === "expired") return <span className={`${base} bg-gray-200 text-gray-700`}>EXPIRED</span>;
    if (status === "cancelled") return <span className={`${base} bg-gray-200 text-gray-800`}>CANCELLED</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{String(status).toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-64 md:h-96">
                <img src={mainImage} alt={house.title} className="w-full h-full object-cover" />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden ${
                        index === currentImageIndex ? "ring-2 ring-indigo-500" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {typeLabels[house.type] || "Property"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        house.furnished === "fully"
                          ? "bg-green-100 text-green-700"
                          : house.furnished === "semi"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {furnishedLabels[house.furnished] || house.furnished}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{house.title}</h1>
                  <div className="flex items-center gap-1 text-gray-500 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{house.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">₹{Number(house.rent || 0).toLocaleString("en-IN")}</div>
                  <div className="text-gray-500">per month</div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <Bed className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <div className="text-lg font-semibold">{house.beds}</div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <div className="text-lg font-semibold">{house.baths}</div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                </div>
                <div className="text-center">
                  <Square className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <div className="text-lg font-semibold">{house.area}</div>
                  <div className="text-sm text-gray-500">Sq Ft</div>
                </div>
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <div className="text-lg font-semibold">
                    {house.availability ? new Date(house.availability).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "-"}
                  </div>
                  <div className="text-sm text-gray-500">Available</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{house.description}</p>
              </div>

              {/* Amenities */}
              {Array.isArray(house.amenities) && house.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {house.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-semibold">₹</span>
                    <span>Monthly Rent</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{Number(house.rent || 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Security Deposit</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{Number(house.deposit || 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-5 h-5" />
                    <span>Booking Amount</span>
                  </div>
                  <span className="font-semibold text-gray-900">{bookingAmount > 0 ? `₹${bookingAmount.toLocaleString("en-IN")}` : "Not set"}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={bookingAmount <= 0}
                className={`mt-4 w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  bookingAmount > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Book Now (Pay ₹ Booking)
              </button>

              {bookingAmount <= 0 && <p className="mt-2 text-xs text-gray-500">Booking amount is not set by landlord for this property.</p>}
            </div>

            {/* Landlord Card */}
            {landlord && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Owner</h2>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                    {landlord.name?.charAt(0)?.toUpperCase() || "L"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{landlord.name}</div>
                    <div className="text-sm text-gray-500">Property Owner</div>
                  </div>
                </div>

                <button
                  onClick={handleContact}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Contact Landlord
                </button>
              </div>
            )}

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Schedule a visit before making a decision</li>
                <li>• Check the neighborhood during different times</li>
                <li>• Review the lease terms carefully</li>
                <li>• Ask about included utilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && landlord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Landlord</h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-bold text-indigo-600">
                  {landlord.name?.charAt(0)?.toUpperCase() || "L"}
                </div>
                <div>
                  <div className="font-semibold">{landlord.name}</div>
                  <div className="text-sm text-gray-500">Property Owner</div>
                </div>
              </div>

              <div className="space-y-2">
                {landlord.email && (
                  <a href={`mailto:${landlord.email}`} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{landlord.email}</span>
                  </a>
                )}
                {landlord.phone && (
                  <a href={`tel:${landlord.phone}`} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition">
                    <Phone className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{landlord.phone}</span>
                  </a>
                )}
              </div>
            </div>

            <button onClick={() => setShowContactModal(false)} className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pay Booking Amount</h3>
                <p className="text-sm text-gray-600">Pay ₹{bookingAmount.toLocaleString("en-IN")} to book this property.</p>
              </div>
              <button onClick={closeBookingModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {payLoading ? (
              <div className="mt-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : activeBooking?.bookingId ? (
              <div className="mt-5">
                <div className="rounded-xl border p-4 bg-red-50">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-700">Active booking already exists</div>
                      <div className="text-sm text-red-700/90 mt-1">{activeBooking.message}</div>
                      <div className="text-xs text-gray-600 mt-2">
                        Booking ID: <b>{activeBooking.bookingId}</b>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={cancelBooking}
                  disabled={cancelLoading}
                  className="mt-4 w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {cancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                  {cancelLoading ? "Cancelling..." : "Cancel Booking"}
                </button>

                <button onClick={closeBookingModal} className="mt-3 w-full py-2.5 border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            ) : payData ? (
              <div className="mt-5">
                <div className="rounded-xl border p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₹{Number(payData.amount || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay To: <b>{payData?.payee?.upiId || "UPI"}</b>
                      </p>
                    </div>
                    {statusBadge(bookingStatus)}
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <div className="rounded-xl border p-3">
                    <QRCodeCanvas value={payData.upiLink} size={220} />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => copyText(payData.upiLink)}
                    className="w-full py-2.5 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy UPI Link
                  </button>

                  <button onClick={() => (window.location.href = payData.upiLink)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
                    Open UPI App
                  </button>

                  <button onClick={markAsPaid} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
                    I Have Paid
                  </button>

                  <button
                    onClick={manualCheckStatus}
                    disabled={checkingStatus}
                    className="w-full py-2.5 border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${checkingStatus ? "animate-spin" : ""}`} />
                    {checkingStatus ? "Checking..." : "Check Status"}
                  </button>

                  {/* ✅ Optional cancel even after initiate */}
                  <button
                    onClick={cancelBooking}
                    disabled={cancelLoading}
                    className="w-full py-2.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    title="Cancel this booking if you don't want to proceed"
                  >
                    {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                    {cancelLoading ? "Cancelling..." : "Cancel Booking"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Booking ID: <b>{payData.bookingId}</b>
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-red-600">Payment details not available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
