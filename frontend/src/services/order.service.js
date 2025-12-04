import api from "./api";

const OrderService = {
  list: async () => {
    const res = await api.get("/order");
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/order/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/order", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/order/${id}`, payload);
    return res.data;
  },

  cancel: async (id) => {
    const res = await api.post(`/order/${id}`);
    return res.data;
  }
};

export default OrderService;
