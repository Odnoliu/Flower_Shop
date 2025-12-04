import api from "./api";


const UserService = {
  getByPhone: async (phone) => {
    const res = await api.get(`/user/${phone}`);
    return res.data;
  },

  list: async () => {
    const res = await api.get(`/user`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/user", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/user/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/user/${id}`);
    return res.data;
  },
};

export default UserService;
