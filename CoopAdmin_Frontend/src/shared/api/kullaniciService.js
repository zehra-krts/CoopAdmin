import api from "./axios.js";

export const getAllKullanicilar = async () => {
  const response = await api.get("/api/kullanicilar");
  return response.data;
};

export const createKullanici = async (payload) => {
  const response = await api.post("/api/kullanicilar", payload);
  return response.data;
};

export const updateKullanici = async (id, payload) => {
  const response = await api.put(`/api/kullanicilar/${id}`, payload);
  return response.data;
};

export const updateKullaniciDurum = async (id, durum) => {
  const response = await api.patch(`/api/kullanicilar/${id}/durum`, { durum });
  return response.data;
};

export const deleteKullanici = async (id) => {
  await api.delete(`/api/kullanicilar/${id}`);
};
