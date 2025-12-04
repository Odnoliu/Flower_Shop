import api from "./api";

const PaymentService = {
  create: async (payload) => {
    const res = await api.post("/payment/qr", payload);
    return res.data;
  }
};

export default PaymentService;
