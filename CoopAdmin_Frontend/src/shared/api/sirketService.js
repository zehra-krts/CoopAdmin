import api from "./axios.js";

export const getAllSirketler = async () => {
  const response = await api.get("/api/sirketler");
  return response.data;
};

export const getSirketById = async (id) => {
  const response = await api.get(`/api/sirketler/${id}`);
  return response.data;
};

export const createSirket = async (payload) => {
  const response = await api.post("/api/sirketler", payload);
  return response.data;
};

export const updateSirket = async (id, payload) => {
  const response = await api.put(`/api/sirketler/${id}`, payload);
  return response.data;
};

export const updateSirketDurum = async (id, durum) => {
  const response = await api.patch(`/api/sirketler/${id}/durum`, { durum });
  return response.data;
};

export const deleteSirket = async (id) => {
  await api.delete(`/api/sirketler/${id}`);
};
