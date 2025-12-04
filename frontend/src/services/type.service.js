import api from "./api";


const TypeService = {
  list: async (params) => {
    const res = await api.get("/type", { params });
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/type/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/type", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/type/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/type/${id}`);
    return res.data;
  }
};

export default TypeService;
