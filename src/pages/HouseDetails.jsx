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
  UploadCloud,
  Image as ImageIcon,
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

  // ✅ Manual proof state
  const [utrInput, setUtrInput] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  // ✅ Visit scheduling modal
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitForm, setVisitForm] = useState({
    scheduledAt: "",
    note: "",
  });

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

  // ✅ Open Schedule Visit
  const openVisitModal = () => {
    if (!user || !token) {
      showToast("Please login to schedule a visit", "info");
      navigate("/login");
      return;
    }
    if (user?.role !== "tenant") {
      showToast("Only tenants can schedule visits.", "info");
      return;
    }
    setVisitForm({ scheduledAt: "", note: "" });
    setShowVisitModal(true);
  };

  // ✅ Submit visit request
  const submitVisitRequest = async (e) => {
    e.preventDefault();

    if (!visitForm.scheduledAt) {
      showToast("Please select a date & time for the visit.", "error");
      return;
    }

    const start = new Date(visitForm.scheduledAt);
    if (Number.isNaN(start.getTime())) {
      showToast("Invalid date/time. Please try again.", "error");
      return;
    }

    const end = new Date(start.getTime() + 30 * 60 * 1000);

    if (start.getTime() < Date.now() + 5 * 60 * 1000) {
      showToast("Please choose a time at least 5 minutes from now.", "error");
      return;
    }

    setVisitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          houseId: id,
          start: start.toISOString(),
          end: end.toISOString(),
          message: visitForm.note?.trim() || "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to schedule visit");

      showToast("Visit request sent ✅ Landlord will approve/reject.", "success");
      setShowVisitModal(false);
    } catch (err) {
      showToast(err.message || "Failed to schedule visit", "error");
    } finally {
      setVisitLoading(false);
    }
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

    // reset proof state
    setUtrInput("");
    setProofUrl("");
    setUploadingProof(false);
    setSubmittingProof(false);
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

        // ✅ Updated success meaning
        if (status === "approved") {
          stopPolling();
          showToast("Booking approved ✅ You are now confirmed!", "success");
        }
        if (status === "transferred") {
          stopPolling();
          showToast("Payout transferred ✅ Booking complete!", "success");
        }
        if (status === "rejected") {
          stopPolling();
          showToast("Booking rejected ❌ Please contact support/admin.", "error");
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

      if (data.status === "approved") {
        showToast("Booking approved ✅", "success");
      } else if (data.status === "payment_submitted") {
        showToast("Payment submitted ✅ Admin will verify soon.", "info");
      } else {
        showToast(`Current status: ${data.status}`, "info");
      }
    } catch (err) {
      showToast(err.message || "Failed to check status", "error");
    } finally {
      setCheckingStatus(false);
    }
  };

  // ✅ Upload screenshot proof to Cloudinary via your backend
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // ✅ Submit proof (UTR required)
  const submitPaymentProof = async () => {
    if (!payData?.bookingId) return;

    const utr = String(utrInput || "").trim();
    if (!utr) {
      showToast("UTR / Transaction ID is required", "error");
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${payData.bookingId}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utr, proofUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit payment proof");

      setBookingStatus("payment_submitted");
      showToast("Payment proof submitted ✅ Admin will verify soon.", "success");
    } catch (err) {
      showToast(err.message || "Failed to submit proof", "error");
    } finally {
      setSubmittingProof(false);
    }
  };

  // ✅ Cancel booking
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

      setActiveBooking(null);
      setPayData(null);
      setBookingStatus("cancelled");
      stopPolling();
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

    // reset proof inputs
    setUtrInput("");
    setProofUrl("");

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

      if (!res.ok) {
        if (res.status === 400 && data?.bookingId) {
          setActiveBooking({ bookingId: data.bookingId, message: data?.message || "Active booking exists." });
          showToast(data?.message || "Active booking exists. You can cancel it.", "info");
          return;
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
    if (status === "payment_submitted")
      return <span className={`${base} bg-blue-100 text-blue-700`}>SUBMITTED (VERIFY)</span>;
    if (status === "paid") return <span className={`${base} bg-blue-100 text-blue-700`}>PAID (LEGACY)</span>;
    if (status === "initiated" || status === "created")
      return <span className={`${base} bg-yellow-100 text-yellow-700`}>AWAITING PAYMENT</span>;
    if (status === "rejected") return <span className={`${base} bg-red-100 text-red-700`}>REJECTED</span>;
    if (status === "failed") return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    if (status === "expired") return <span className={`${base} bg-gray-200 text-gray-700`}>EXPIRED</span>;
    if (status === "cancelled") return <span className={`${base} bg-gray-200 text-gray-800`}>CANCELLED</span>;
    if (status === "checking") return <span className={`${base} bg-gray-100 text-gray-700`}>CHECKING...</span>;
    return <span className={`${base} bg-gray-100 text-gray-700`}>{String(status).toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
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
                          className={`w-2.5 h-2.5 rounded-full transition ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
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
                  <div className="text-3xl font-bold text-indigo-600">
                    ₹{Number(house.rent || 0).toLocaleString("en-IN")}
                  </div>
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
                    {house.availability
                      ? new Date(house.availability).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                      : "-"}
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
                  <span className="font-semibold text-gray-900">
                    ₹{Number(house.rent || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Security Deposit</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(house.deposit || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-5 h-5" />
                    <span>Booking Amount</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {bookingAmount > 0 ? `₹${bookingAmount.toLocaleString("en-IN")}` : "Not set"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={bookingAmount <= 0}
                className={`mt-4 w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  bookingAmount > 0
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Book Now (Pay ₹ Booking)
              </button>

              {bookingAmount <= 0 && (
                <p className="mt-2 text-xs text-gray-500">Booking amount is not set by landlord for this property.</p>
              )}

              {/* ✅ Schedule Visit */}
              <button
                onClick={openVisitModal}
                className="mt-3 w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Visit
              </button>

              <p className="mt-2 text-xs text-gray-500">
                Request a visit time. Landlord will approve/reject your request.
              </p>
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
                  <a
                    href={`mailto:${landlord.email}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition"
                  >
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{landlord.email}</span>
                  </a>
                )}
                {landlord.phone && (
                  <a
                    href={`tel:${landlord.phone}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition"
                  >
                    <Phone className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">{landlord.phone}</span>
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Schedule a Visit</h3>
                <p className="text-sm text-gray-600">Pick a time. Landlord will approve/reject.</p>
              </div>
              <button onClick={() => setShowVisitModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={submitVisitRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date & Time</label>
                <input
                  type="datetime-local"
                  value={visitForm.scheduledAt}
                  onChange={(e) => setVisitForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">Tip: Choose a time at least 30–60 mins from now.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea
                  value={visitForm.note}
                  onChange={(e) => setVisitForm((p) => ({ ...p, note: e.target.value }))}
                  rows={3}
                  placeholder="Example: I can visit after 6 PM. Please confirm."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={visitLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {visitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                {visitLoading ? "Sending..." : "Send Visit Request"}
              </button>

              <button
                type="button"
                onClick={() => setShowVisitModal(false)}
                className="w-full py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

  {/* ✅ Booking Modal (Responsive) */}
{showBookingModal && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/50" onClick={closeBookingModal} />

    {/* Modal wrapper */}
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
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Pay Booking Amount</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Pay ₹{bookingAmount.toLocaleString("en-IN")} to book this property.
            </p>
          </div>

          <button
            onClick={closeBookingModal}
            className="shrink-0 w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[calc(92vh-64px)] sm:max-h-[calc(90vh-72px)]">
          {payLoading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : activeBooking?.bookingId ? (
            <div className="mt-2">
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
                type="button"
              >
                {cancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                {cancelLoading ? "Cancelling..." : "Cancel Booking"}
              </button>

              <button
                onClick={closeBookingModal}
                className="mt-3 w-full py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition"
                type="button"
              >
                Close
              </button>
            </div>
          ) : payData ? (
            <div className="mt-2">
              {/* Summary */}
              <div className="rounded-xl border p-4 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{Number(payData.amount || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 break-all">
                      Pay To: <b>{payData?.payee?.upiId || "UPI"}</b>
                    </p>
                  </div>

                  <div className="shrink-0">{statusBadge(bookingStatus)}</div>
                </div>
              </div>

              {/* QR */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-xl border p-3 bg-white">
                  <QRCodeCanvas value={payData.upiLink} size={220} />
                </div>
              </div>

              {/* ✅ Payment Proof Section */}
              <div className="mt-4 rounded-xl border p-4 bg-gray-50">
                <div className="font-semibold text-gray-900">After Payment</div>
                <p className="text-xs text-gray-600 mt-1">
                  Enter your UTR/Transaction ID and (optional) upload screenshot.
                </p>

                <div className="mt-3 space-y-3">
                  <input
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="UTR / Transaction ID *"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium">
                        {uploadingProof ? "Uploading..." : "Upload Screenshot"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProof}
                        onChange={(e) => uploadProofImage(e.target.files?.[0])}
                      />
                    </label>

                    <button
                      type="button"
                      disabled={!proofUrl}
                      onClick={() => window.open(proofUrl, "_blank")}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      View
                    </button>
                  </div>

                  {proofUrl ? (
                    <div className="text-xs text-green-700 font-medium">Screenshot uploaded ✅</div>
                  ) : (
                    <div className="text-xs text-gray-500">Screenshot is optional, but recommended.</div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => copyText(payData.upiLink)}
                  className="w-full py-2.5 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                  type="button"
                >
                  <Copy className="w-4 h-4" />
                  Copy UPI Link
                </button>

                <button
                  onClick={() => (window.location.href = payData.upiLink)}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
                  type="button"
                >
                  Open UPI App
                </button>

                <button
                  onClick={submitPaymentProof}
                  disabled={submittingProof}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition sm:col-span-2 disabled:opacity-60"
                  type="button"
                >
                  {submittingProof ? "Submitting..." : "Submit Payment Proof"}
                </button>

                <button
                  onClick={manualCheckStatus}
                  disabled={checkingStatus}
                  className="w-full py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  type="button"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingStatus ? "animate-spin" : ""}`} />
                  {checkingStatus ? "Checking..." : "Check Status"}
                </button>

                <button
                  onClick={cancelBooking}
                  disabled={cancelLoading}
                  className="w-full py-2.5 border border-red-200 text-red-700 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  type="button"
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                  {cancelLoading ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 break-all">
                Booking ID: <b>{payData.bookingId}</b>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-red-600">Payment details not available.</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};
