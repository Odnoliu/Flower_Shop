import api from "./api";

const CartService = {
  getCart: async () => {
    const res = await api.get("/cart");
    return res.data;
  },

  addItem: async (payload) => {
    const res = await api.post("/cart/", payload);
    return res.data;
  },

  updateItem: async (itemId, payload) => {
    const res = await api.put(`/cart/${itemId}`, payload);
    return res.data;
  },


  clear: async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
  },

};

export default CartService;
