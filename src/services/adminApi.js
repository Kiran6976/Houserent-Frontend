const API_URL = import.meta.env.VITE_API_URL;

export const adminDeleteUser = async (userId, token) => {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Delete failed");
  }

  return data;
};
