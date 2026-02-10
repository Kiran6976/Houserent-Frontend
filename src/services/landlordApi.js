// src/services/landlordApi.js (FULL UPDATED FILE)
const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// -----------------------------
// Existing (Tenants page)
// -----------------------------
export const landlordGetTenants = async (token) => {
  const res = await fetch(`${API_URL}/api/landlord/tenants`, {
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load tenants");
  return data; // { success, tenants }
};

export const landlordVacateHouse = async (houseId, token) => {
  const res = await fetch(`${API_URL}/api/landlord/houses/${houseId}/vacate`, {
    method: "POST",
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to vacate house");
  return data;
};

// -----------------------------
// NEW: Rent Payments (folders + history + approve/reject)
// -----------------------------

// ✅ List tenants as "folders" with counts
// GET /api/rent-payments/landlord/folders
export const landlordRentFolders = async (token) => {
  const res = await fetch(`${API_URL}/api/rent-payments/landlord/folders`, {
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load rent folders");
  return data; // { success, folders: [{ tenant, pending, totalPayments }] }
};

// ✅ Get full rent history for one tenant
// GET /api/rent-payments/landlord/tenant/:tenantId
export const landlordRentHistoryByTenant = async (tenantId, token) => {
  const res = await fetch(`${API_URL}/api/rent-payments/landlord/tenant/${tenantId}`, {
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load tenant rent history");
  return data; // { success, payments: [...] }
};

// ✅ Pending approvals (optional, if you still want to use it anywhere)
// GET /api/rent-payments/landlord/pending
export const landlordRentPending = async (token) => {
  const res = await fetch(`${API_URL}/api/rent-payments/landlord/pending`, {
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load pending rent payments");
  return data; // { success, payments: [...] }
};

// ✅ Approve payment
// PUT /api/rent-payments/:id/approve
export const landlordApproveRentPayment = async (paymentId, token) => {
  const res = await fetch(`${API_URL}/api/rent-payments/${paymentId}/approve`, {
    method: "PUT",
    headers: authHeaders(token),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Approve failed");
  return data; // { success, status }
};

// ✅ Reject payment (with optional note)
// PUT /api/rent-payments/:id/reject
export const landlordRejectRentPayment = async (paymentId, note, token) => {
  const res = await fetch(`${API_URL}/api/rent-payments/${paymentId}/reject`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ note: String(note || "").trim() }),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Reject failed");
  return data; // { success, status }
};
