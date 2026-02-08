// src/services/landlordApi.js
const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

export const landlordGetTenants = async (token) => {
  const res = await fetch(`${API_URL}/api/landlord/tenants`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load tenants");
  return data; // { success, tenants }
};

export const landlordVacateHouse = async (houseId, token) => {
  const res = await fetch(`${API_URL}/api/landlord/houses/${houseId}/vacate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to vacate house");
  return data;
};
