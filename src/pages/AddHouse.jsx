import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AMENITIES_OPTIONS = [
  "WiFi",
  "Parking",
  "Gym",
  "Pool",
  "Power Backup",
  "Security",
  "Water",
  "Laundry",
  "Garden",
  "Pet Friendly",
  "AC",
  "Heating",
];

const HOUSE_TYPES = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "room", label: "Room", icon: "🚪" },
  { value: "house", label: "House", icon: "🏠" },
];

const FURNISHED_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi", label: "Semi-Furnished" },
  { value: "fully", label: "Fully Furnished" },
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
];

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <div className="flex items-end justify-between gap-3">
      <label className="block text-sm font-semibold text-slate-800">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
    <div className="mt-2">{children}</div>
    {error ? <p className="mt-1.5 text-sm text-rose-600">{error}</p> : null}
  </div>
);

const Section = ({ title, subtitle, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur px-5 sm:px-6 py-5 shadow-sm">
    <div className="mb-4">
      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
    {children}
  </div>
);

export const AddHouse = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    rent: "",
    deposit: "",
    bookingAmount: "",
    type: "apartment",
    beds: "1",
    baths: "1",
    area: "",
    furnished: "unfurnished",
    amenities: [],
    images: [],
    availability: new Date().toISOString().split("T")[0],

    electricityBillUrl: "",
    electricityBillType: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [billUploading, setBillUploading] = useState(false);

  const authJsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    const loadHouse = async () => {
      if (!isEdit || !id) return;

      setPageLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/houses/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load house");

        setFormData({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          rent: data.rent != null ? String(data.rent) : "",
          deposit: data.deposit != null ? String(data.deposit) : "",
          bookingAmount: data.bookingAmount != null ? String(data.bookingAmount) : "",
          type: data.type || "apartment",
          beds: data.beds != null ? String(data.beds) : "1",
          baths: data.baths != null ? String(data.baths) : "1",
          area: data.area != null ? String(data.area) : "",
          furnished: data.furnished || "unfurnished",
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          images: Array.isArray(data.images) ? data.images : [],
          availability: data.availability
            ? String(data.availability).split("T")[0]
            : new Date().toISOString().split("T")[0],

          electricityBillUrl: data.electricityBillUrl || "",
          electricityBillType: data.electricityBillType || "",
        });
      } catch (err) {
        showToast(err.message || "Failed to load house", "error");
        navigate("/landlord/dashboard");
      } finally {
        setPageLoading(false);
      }
    };

    loadHouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    const rent = parseFloat(formData.rent);
    if (!formData.rent || isNaN(rent) || rent <= 0) newErrors.rent = "Valid rent amount is required";

    const deposit = parseFloat(formData.deposit);
    if (!formData.deposit || isNaN(deposit) || deposit <= 0)
      newErrors.deposit = "Valid deposit amount is required";

    const area = parseFloat(formData.area);
    if (!formData.area || isNaN(area) || area <= 0) newErrors.area = "Valid area is required";

    if (formData.bookingAmount !== "") {
      const bookingAmount = parseFloat(formData.bookingAmount);
      if (isNaN(bookingAmount) || bookingAmount < 0) {
        newErrors.bookingAmount = "Booking amount must be 0 or more";
      }
    }

    if (!formData.electricityBillUrl) {
      newErrors.electricityBillUrl = "Electricity bill is required (PDF/JPG/PNG)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addSampleImage = () => {
    const randomImage = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    if (!formData.images.includes(randomImage)) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, randomImage] }));
    }
  };

  const handleDeviceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP images allowed", "error");
      e.target.value = "";
      return;
    }

    if (!token) {
      showToast("Please login again (token missing)", "error");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${API_URL}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      if (!data?.url) throw new Error("Upload failed: no URL returned");

      setFormData((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      showToast("Image uploaded", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleBillUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      showToast("Only PDF, JPG, PNG, WEBP allowed", "error");
      e.target.value = "";
      return;
    }

    if (!token) {
      showToast("Please login again (token missing)", "error");
      e.target.value = "";
      return;
    }

    setBillUploading(true);
    try {
      const form = new FormData();
      form.append("bill", file);

      const res = await fetch(`${API_URL}/api/uploads/electricity-bill`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Bill upload failed");
      if (!data?.url) throw new Error("Upload failed: no URL returned");

      setFormData((prev) => ({
        ...prev,
        electricityBillUrl: data.url,
        electricityBillType: data.mimeType || file.type || "",
      }));

      if (errors.electricityBillUrl) {
        setErrors((prev) => ({ ...prev, electricityBillUrl: undefined }));
      }

      showToast("Electricity bill uploaded", "success");
    } catch (err) {
      showToast(err.message || "Bill upload failed", "error");
    } finally {
      setBillUploading(false);
      e.target.value = "";
    }
  };

  const removeBill = () => {
    setFormData((prev) => ({ ...prev, electricityBillUrl: "", electricityBillType: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    if (!user || !token) {
      showToast("Please login again", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        rent: Number(formData.rent),
        deposit: Number(formData.deposit),
        bookingAmount: formData.bookingAmount === "" ? 0 : Number(formData.bookingAmount),
        type: formData.type,
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        area: Number(formData.area),
        furnished: formData.furnished,
        amenities: formData.amenities,
        images:
          formData.images.length > 0
            ? formData.images
            : [SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]],
        availability: formData.availability,
        electricityBillUrl: formData.electricityBillUrl,
        electricityBillType: formData.electricityBillType,
      };

      const url = isEdit ? `${API_URL}/api/houses/${id}` : `${API_URL}/api/houses`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authJsonHeaders,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to save property");

      showToast(
        isEdit
          ? "Property updated successfully!"
          : "Property submitted for verification (pending admin approval)!",
        "success"
      );
      navigate("/landlord/dashboard");
    } catch (err) {
      showToast(err.message || "Failed to save property. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-700">
          <Loader2 className="w-7 h-7 animate-spin" />
          <span className="font-semibold">Loading property…</span>
        </div>
      </div>
    );
  }

  const billIsPdf = String(formData.electricityBillType || "").toLowerCase().includes("pdf");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-10">
      {/* soft blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-200/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-200/40 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/landlord/dashboard")}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mt-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {isEdit ? "Edit Property" : "Add New Property"}
          </h1>
          <p className="mt-1 text-slate-600">
            Fill the details below. Your property may require admin approval.
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur shadow-xl shadow-indigo-100/40 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Section title="Property Basics" subtitle="Tell tenants what you’re listing.">
              <div className="space-y-5">
                <Field label="Property Title" required error={errors.title}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.title ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="e.g., Modern 2BHK Apartment near Metro"
                  />
                </Field>

                <Field label="Description" required error={errors.description}>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.description ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="Describe the property, its features, and surroundings..."
                  />
                </Field>

                <Field label="Location / Address" required error={errors.location}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.location ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="e.g., Agartala, Tripura"
                  />
                </Field>

                <Field label="Property Type">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {HOUSE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                        className={`p-4 rounded-2xl border transition-all text-left ${
                          formData.type === type.value
                            ? "border-indigo-300 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-2xl">{type.icon}</div>
                        <div className="mt-1 font-semibold">{type.label}</div>
                        <div className="text-xs text-slate-500">Choose type</div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Pricing" subtitle="Set rent, deposit, and optional booking fee.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Rent per Month (₹)" required error={errors.rent}>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.rent ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="10000"
                  />
                </Field>

                <Field label="Security Deposit (₹)" required error={errors.deposit}>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.deposit ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="20000"
                  />
                </Field>

                <Field
                  label="Booking Amount (₹)"
                  error={errors.bookingAmount}
                  hint="Optional"
                >
                  <input
                    type="number"
                    name="bookingAmount"
                    value={formData.bookingAmount}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.bookingAmount ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Tenant pays this via UPI to book (optional).
                  </p>
                </Field>
              </div>
            </Section>

            <Section title="Details" subtitle="Bedrooms, bathrooms, area, furnishing, availability.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Bedrooms">
                  <select
                    name="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Bathrooms">
                  <select
                    name="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Area (sqft)" required error={errors.area}>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-2xl border ${
                      errors.area ? "border-rose-300" : "border-slate-200"
                    } bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition`}
                    placeholder="1200"
                  />
                </Field>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Furnished Status">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FURNISHED_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, furnished: option.value }))}
                        className={`p-3 rounded-2xl border transition-all text-left ${
                          formData.furnished === option.value
                            ? "border-indigo-300 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-slate-500">Select</div>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Available From">
                  <input
                    type="date"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Amenities" subtitle="Pick what’s available for tenants.">
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((amenity) => {
                  const active = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ring-1 ring-inset ${
                        active
                          ? "bg-indigo-600 text-white ring-indigo-600"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Uploads" subtitle="Add photos and upload electricity bill for verification.">
              {/* Images */}
              <Field label="Property Images" hint="Optional (recommended)">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none"
                    placeholder="Paste image URL…"
                  />

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={addImage}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                      title="Add image URL"
                    >
                      <Upload className="w-4 h-4" />
                      Add
                    </button>

                    <label
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-semibold transition cursor-pointer ${
                        uploading
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      title="Upload from device"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      {uploading ? "Uploading…" : "Device"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDeviceUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={addSampleImage}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition border border-indigo-200"
                    >
                      ✨ Sample
                    </button>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <img src={img} alt={`Property ${index + 1}`} className="w-full h-24 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-white/90 text-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition shadow"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              {/* Bill */}
              <Field
                label="Electricity Bill (PDF/JPG/PNG)"
                required
                error={errors.electricityBillUrl}
                hint="Required"
              >
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <label
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border font-semibold transition cursor-pointer ${
                      billUploading
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Upload electricity bill"
                  >
                    {billUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {billUploading ? "Uploading…" : "Upload Bill"}
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleBillUpload}
                      disabled={billUploading}
                      className="hidden"
                    />
                  </label>

                  {formData.electricityBillUrl ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={formData.electricityBillUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition font-semibold"
                        title="View bill"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {billIsPdf ? "View PDF" : "View Image"}
                      </a>

                      <button
                        type="button"
                        onClick={removeBill}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition font-semibold"
                        title="Remove bill"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Upload a recent bill for verification.
                    </p>
                  )}
                </div>
              </Field>
            </Section>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/landlord/dashboard")}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || uploading || billUploading}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Update Property"
                ) : (
                  "Add Property"
                )}
              </button>
            </div>

            {!isEdit && (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                After submission, your property will be{" "}
                <span className="font-semibold text-slate-900">pending</span> until admin approves the electricity bill.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
