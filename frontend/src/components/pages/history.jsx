import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Calendar } from "lucide-react";

export default function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fakeOrders = [
      {
        id: 101,
        order_date: "2025-11-01",
        total: 450000,
        delivery_address: "123 Lê Lợi, Quận 1, TP.HCM",
        status: "Đã giao",
      },
      {
        id: 102,
        order_date: "2025-11-03",
        total: 320000,
        delivery_address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
        status: "Đang xử lý",
      },
      {
        id: 103,
        order_date: "2025-11-06",
        total: 750000,
        delivery_address: "78 Trần Hưng Đạo, Quận 5, TP.HCM",
        status: "Đã giao",
      },
      {
        id: 104,
        order_date: "2025-11-08",
        total: 120000,
        delivery_address: "12 Phạm Ngũ Lão, Quận 1, TP.HCM",
        status: "Đã hủy",
      },
      {
        id: 105,
        order_date: "2025-11-12",
        total: 290000,
        delivery_address: "9 Pasteur, Quận 3, TP.HCM",
        status: "Đã giao",
      },
    ];

    const successful = fakeOrders.filter((o) => o.status == "Đã giao");

    const t = setTimeout(() => setOrders(successful), 200);
    return () => clearTimeout(t);
  }, []);

  const moneyFmt = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F] flex items-center gap-3">
        <Package size={36} className="text-[#CDB38B]" />
        Lịch sử mua hàng
      </h1>

      <div className="space-y-6">
        {orders.length == 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 py-8"
          >
            Bạn chưa có đơn hàng đã giao nào.
          </motion.div>
        ) : (
          orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-[#3F3F3F]">
                    Đơn hàng #{order.id}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={16} />
                    {order.order_date}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  {order.status}
                </span>
              </div>

              <p className="text-[#CDB38B] font-bold">{moneyFmt(order.total)}</p>
              <p className="text-sm text-gray-600 mt-1">
                Giao đến: {order.delivery_address}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.main>
  );
}
