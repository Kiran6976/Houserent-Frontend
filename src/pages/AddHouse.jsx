import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loader2, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";

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

// Sample image URLs for demo
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
];

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
    bookingAmount: "", // ✅ NEW
    type: "apartment",
    beds: "1",
    baths: "1",
    area: "",
    furnished: "unfurnished",
    amenities: [],
    images: [],
    availability: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // submit loading
  const [pageLoading, setPageLoading] = useState(false); // edit load
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const authJsonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Load house in edit mode
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
          bookingAmount: data.bookingAmount != null ? String(data.bookingAmount) : "", // ✅ NEW
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
    if (!formData.rent || isNaN(rent) || rent <= 0) {
      newErrors.rent = "Valid rent amount is required";
    }

    const deposit = parseFloat(formData.deposit);
    if (!formData.deposit || isNaN(deposit) || deposit <= 0) {
      newErrors.deposit = "Valid deposit amount is required";
    }

    const area = parseFloat(formData.area);
    if (!formData.area || isNaN(area) || area <= 0) {
      newErrors.area = "Valid area is required";
    }

    // ✅ Booking amount is optional but must be >= 0 if provided
    if (formData.bookingAmount !== "") {
      const bookingAmount = parseFloat(formData.bookingAmount);
      if (isNaN(bookingAmount) || bookingAmount < 0) {
        newErrors.bookingAmount = "Booking amount must be 0 or more";
      }
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
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSampleImage = () => {
    const randomImage = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    if (!formData.images.includes(randomImage)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, randomImage],
      }));
    }
  };

  // Upload device image -> backend -> Cloudinary -> returns secure_url
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

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));

      showToast("Image uploaded", "success");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Create / Update house
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
        bookingAmount: formData.bookingAmount === "" ? 0 : Number(formData.bookingAmount), // ✅ NEW
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

      showToast(isEdit ? "Property updated successfully!" : "Property added successfully!", "success");
      navigate("/landlord/dashboard");
    } catch (err) {
      showToast(err.message || "Failed to save property. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/landlord/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? "Edit Property" : "Add New Property"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="e.g., Modern 2BHK Apartment near Metro"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="Describe the property, its features, and surroundings..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.location ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                placeholder="e.g., Agartala, Tripura"
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <div className="grid grid-cols-3 gap-3">
                {HOUSE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === type.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rent, Deposit, Booking Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Month (₹) *</label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.rent ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="10000"
                />
                {errors.rent && <p className="mt-1 text-sm text-red-500">{errors.rent}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹) *</label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.deposit ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="20000"
                />
                {errors.deposit && <p className="mt-1 text-sm text-red-500">{errors.deposit}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Amount (₹)</label>
                <input
                  type="number"
                  name="bookingAmount"
                  value={formData.bookingAmount}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.bookingAmount ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="500"
                />
                {errors.bookingAmount && (
                  <p className="mt-1 text-sm text-red-500">{errors.bookingAmount}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Tenant will pay this amount using UPI to book (optional).
                </p>
              </div>
            </div>

            {/* Beds, Baths, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  name="beds"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  name="baths"
                  value={formData.baths}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.area ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition`}
                  placeholder="1200"
                />
                {errors.area && <p className="mt-1 text-sm text-red-500">{errors.area}</p>}
              </div>
            </div>

            {/* Furnished */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Furnished Status</label>
              <div className="grid grid-cols-3 gap-3">
                {FURNISHED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, furnished: option.value }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.furnished === option.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.amenities.includes(amenity)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Paste image URL..."
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    title="Add image URL"
                  >
                    <Upload className="w-5 h-5" />
                  </button>

                  <label
                    className={`px-4 py-2 rounded-lg transition text-sm cursor-pointer flex items-center gap-2 ${
                      uploading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Upload from device"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    <span className="hidden sm:inline">{uploading ? "Uploading..." : "Device"}</span>

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
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm"
                  >
                    Add Sample
                  </button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
              <input
                type="date"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/landlord/dashboard")}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update Property"
                ) : (
                  "Add Property"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
