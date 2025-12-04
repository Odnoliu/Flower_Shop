import api from "./api";

const WardService = {
  list: async () => {
    const res = await api.get("/ward");
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/ward/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/ward", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/ward/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/ward/${id}`);
    return res.data;
  },

  listByDistrict: async (districtId) => {
    const res = await api.get(`/district/${districtId}/wards`);
    return res.data;
  }
};

export default WardService;
