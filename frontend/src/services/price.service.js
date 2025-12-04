import api from "./api";

const PriceService = {
  list: async (params) => {
    const res = await api.get("/price", { params });
    return res.data;
  },

  getByProductId: async (id) => {
    const res = await api.get(`/price/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/price", payload);
    return res.data;
  },

  update: async (productId, payload) => {
    const res = await api.put(`/price/${productId}`, payload);
    console.log(res.data)
    return res.data;
  },

  remove: async (effectiveDate, productId) => {
    const res = await api.delete(`/price/${productId}`);
    return res.data;
  },

};

export default PriceService;
