// src/services/adminApi.js
const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

export const adminGetBookings = async (token, status = "pending") => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${API_URL}/api/admin/bookings${qs}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load bookings");
  return data;
};

export const adminApproveBooking = async (bookingId, token, note = "") => {
  const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Approve failed");
  return data;
};

export const adminRejectBooking = async (bookingId, note, token) => {
  const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Reject failed");
  return data;
};

export const adminGetUpiIntent = async (bookingId, token) => {
  const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/upi-intent`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to get UPI intent");
  return data;
};

export const adminMarkTransferred = async (bookingId, payoutTxnId, token) => {
  const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/mark-transferred`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ payoutTxnId }),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Mark transferred failed");
  return data;
};
