import axios from "axios";

const api = axios.create({
  baseURL: "https://nexambss.vercel.app/api",
});

export const consultationApi = {
  getAll: () => api.get("/consultations"),

  getById: (id) => api.get(`/consultations/${id}`),

  create: (data) => api.post("/consultations", data),

  update: (id, data) =>
    api.put(`/consultations/${id}`, data),

  delete: (id) =>
    api.delete(`/consultations/${id}`),
};