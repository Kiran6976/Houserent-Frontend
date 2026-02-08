const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

export const adminDeleteUser = async (userId, token) => {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Delete failed");
  return data;
};

export const adminGetBookings = async (token, status = "paid") => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${API_URL}/api/admin/bookings${qs}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load bookings");
  return { bookings: data?.bookings || [] };
};

export const adminApproveBooking = async (bookingId, token, note = "") => {
  const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/approve`, {
    method: "PUT", // ✅ FIX: was POST
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }), // optional, backend supports it
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Approve failed");
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
  if (!res.ok) throwHttpError(res, data, "UPI intent failed");
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
  if (!res.ok) throwHttpError(res, data, "Mark paid failed");
  return data;
};
