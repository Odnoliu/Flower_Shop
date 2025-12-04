import api from "./api";

const ProductService = {
  list: async () => {
    const res = await api.get("/product");
    console.log(res)
    return res.data;
  },

  get: async (id) => {
    const res = await api.get(`/product/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/product", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/product/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/product/${id}`);
    return res.data;
  }
};

export default ProductService;
