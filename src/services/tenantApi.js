const API_URL = import.meta.env.VITE_API_URL;

export const getMyRentsApi = async (token) => {
  const res = await fetch(`${API_URL}/api/bookings/my-rents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load My Rents");
  return data;
};
