import api from "./api";

const AccountService = {
  list: async () => {
    const res = await api.get("/account");
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/account/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/account", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/account/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/account/${id}`);
    return res.data;
  }
};

export default AccountService;
