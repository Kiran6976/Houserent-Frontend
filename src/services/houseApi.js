const API_URL = import.meta.env.VITE_API_URL;

export const createHouseApi = async (formData, token) => {
  const res = await fetch(`${API_URL}/api/houses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // FormData for images
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create house");
  return data;
};

export const updateHouseApi = async (id, formData, token) => {
  const res = await fetch(`${API_URL}/api/houses/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update house");
  return data;
};

export const getHouseByIdApi = async (id, token) => {
  const res = await fetch(`${API_URL}/api/houses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load house");
  return data;
};
