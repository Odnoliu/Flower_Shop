import api from "./api";

const AddressService = {
  list: async () => {
    const res = await api.get("/address");
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/address/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/address", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/address/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/address/${id}`);
    return res.data;
  }
};

export default AddressService;
