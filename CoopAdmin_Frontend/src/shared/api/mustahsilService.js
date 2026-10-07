import api from "./axios.js";

export const getAllMustahsiller = async () => {
  const response = await api.get("/api/mustahsiller");
  return response.data;
};

export const createMustahsil = async (payload) => {
  const response = await api.post("/api/mustahsiller", payload);
  return response.data;
};

export const updateMustahsil = async (id, payload) => {
  const response = await api.put(`/api/mustahsiller/${id}`, payload);
  return response.data;
};

export const updateMustahsilDurum = async (id, durum) => {
  const response = await api.patch(`/api/mustahsiller/${id}/durum`, { durum });
  return response.data;
};

export const deleteMustahsil = async (id) => {
  await api.delete(`/api/mustahsiller/${id}`);
};
