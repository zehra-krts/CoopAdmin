import axios from "axios";

// Üretimde .env veya build öncesi VITE_API_URL ile backend adresini verin.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5177";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
