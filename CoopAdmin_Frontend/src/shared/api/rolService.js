import api from "./axios.js";

export const getAllRoller = async () => {
  const response = await api.get("/api/roller");
  return response.data;
};
