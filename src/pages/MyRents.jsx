import React, { useEffect, useState } from "react";
import { Loader2, Home } from "lucide-react";
import { HouseCard } from "../components/HouseCard";
import { useAuth } from "../context/AuthContext";
import { getMyRentsApi } from "../services/tenantApi";

export const MyRents = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [houses, setHouses] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyRentsApi(token);
      setHouses(Array.isArray(data?.houses) ? data.houses : []);
    } catch (e) {
      console.error(e);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Rents</h1>
          <p className="text-white/80 mt-2">
            Houses you rented after your booking fee was approved by admin.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {houses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <HouseCard key={house._id || house.id} house={house} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No rented houses yet
            </h3>
            <p className="text-gray-600">
              Once your booking is approved by admin, it will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
