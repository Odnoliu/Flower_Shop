import api from "./api";

const OrderDetailService = {
  listByOrder: async (orderId) => {
    const res = await api.get(`/order/${orderId}/detail`);
    return res.data;
  },

  getByProduct: async (order_id, product_id) => {
    const res = await api.get(`/order/${order_id}/detail/${product_id}`);
    return res.data;
  },

  create: async (orderId, payload) => {
    const res = await api.post(`/order/${orderId}/detail`, payload);
    return res.data;
  },

  update: async (order_id, product_id, payload) => {
    const res = await api.put(`/order/${order_id}/detail/${product_id}`, payload);
    return res.data;
  },

  remove: async (order_id, product_id) => {
    const res = await api.delete(`/order/${order_id}/detail/${product_id}`);
    return res.data;
  }
};

export default OrderDetailService;
