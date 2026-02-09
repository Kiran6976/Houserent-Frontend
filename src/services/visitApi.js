const API_URL = import.meta.env.VITE_API_URL;

export const createVisitApi = async ({ houseId, start, end, message }, token) => {
  const res = await fetch(`${API_URL}/api/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ houseId, start, end, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to request visit");
  return data;
};

export const getMyVisitsApi = async (token) => {
  const res = await fetch(`${API_URL}/api/visits/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load visits");
  return data;
};

export const cancelVisitApi = async (id, note, token) => {
  const res = await fetch(`${API_URL}/api/visits/${id}/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to cancel visit");
  return data;
};

export const getLandlordVisitsApi = async (token) => {
  const res = await fetch(`${API_URL}/api/visits/landlord`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load visit requests");
  return data;
};

export const acceptVisitApi = async (id, payload, token) => {
  const res = await fetch(`${API_URL}/api/visits/${id}/accept`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to accept visit");
  return data;
};

export const rejectVisitApi = async (id, note, token) => {
  const res = await fetch(`${API_URL}/api/visits/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reject visit");
  return data;
};
