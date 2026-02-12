const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

const throwHttpError = (res, data, fallback) => {
  const err = new Error(data?.message || fallback);
  err.statusCode = res.status;
  err.data = data;
  throw err;
};

export const supportUploadFile = async (file, token) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/api/uploads/support`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Upload failed");
  return data; // { url, type }
};

export const createSupportTicket = async (payload, token) => {
  const res = await fetch(`${API_URL}/api/support/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to create ticket");
  return data;
};

export const getMySupportTickets = async (token) => {
  const res = await fetch(`${API_URL}/api/support/tickets`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load tickets");
  return data;
};

export const getSupportTicketDetail = async (ticketId, token) => {
  const res = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to load ticket");
  return data;
};

export const sendSupportMessage = async (ticketId, payload, token) => {
  const res = await fetch(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throwHttpError(res, data, "Failed to send message");
  return data;
};
