import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Home } from "lucide-react";

export const HouseCard = ({ house, showActions, onEdit, onDelete }) => {
  // ✅ Support MongoDB (_id) + old mockDb (id)
  const hid = house?._id || house?.id;

  const typeIcons = {
    apartment: "🏢",
    room: "🚪",
    house: "🏠",
  };

  const furnishedLabels = {
    unfurnished: "Unfurnished",
    semi: "Semi-Furnished",
    fully: "Fully Furnished",
  };

  const image0 =
    (Array.isArray(house?.images) && house.images[0]) ||
    "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image0}
          alt={house?.title || "House"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            {typeIcons[house?.type] || "🏠"}{" "}
            {house?.type
              ? house.type.charAt(0).toUpperCase() + house.type.slice(1)
              : "Property"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              house?.furnished === "fully"
                ? "bg-green-100 text-green-700"
                : house?.furnished === "semi"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {furnishedLabels[house?.furnished] || "Unfurnished"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
            {house?.title || "Untitled Property"}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{house?.location || "—"}</span>
        </div>

        <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{house?.beds ?? 0} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{house?.baths ?? 0} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{house?.area ?? 0} sqft</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-2xl font-bold text-indigo-600">
              ₹{Number(house?.rent || 0).toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>

          {showActions ? (
            <div className="flex gap-2">
              <Link
                to={`/house/${hid}`}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                View
              </Link>

              <button
                onClick={() => onEdit?.(hid)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete?.(hid)}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/house/${hid}`}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
