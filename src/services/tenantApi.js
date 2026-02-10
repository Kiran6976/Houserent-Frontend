const API_URL = import.meta.env.VITE_API_URL;

const safeJson = async (res) => res.json().catch(() => ({}));

export const getMyRentsApi = async (token, status) => {
  if (!token) throw new Error("Unauthorized: token missing");

  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${API_URL}/api/bookings/my-rents${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to load My Rents");
  return data;
};
