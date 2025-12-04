import api from "./api";

const StatusService = {
  list: async (params) => {
    const res = await api.get("/status", { params });
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/status/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/status", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/status/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/status/${id}`);
    return res.data;
  }
};

export default StatusService;
