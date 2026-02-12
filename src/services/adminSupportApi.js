const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

export const adminGetSupportTickets = async (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/admin/support/tickets${qs ? `?${qs}` : ""}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load tickets");
  return data;
};

export const adminGetSupportTicketDetail = async (ticketId, token) => {
  const res = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load ticket");
  return data;
};

export const adminReplySupportTicket = async (ticketId, payload, token) => {
  const res = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Reply failed");
  return data;
};

export const adminUpdateSupportTicket = async (ticketId, payload, token) => {
  const res = await fetch(`${API_URL}/api/admin/support/tickets/${ticketId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Update failed");
  return data;
};
