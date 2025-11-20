import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axios_client";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    axiosClient.get("/order").then((res) => setOrders(res.data));
  }, []);

  const filtered = orders.filter((o) =>
    o.id.toString().includes(search) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.main

      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F] flex items-center gap-3">
        <Package size={36} className="text-[#CDB38B]" />
        Quản lý đơn hàng
      </h1>

      <div className="bg-white border border-[#E8DAB5] rounded-2xl p-4 mb-6 flex items-center gap-3">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Tìm mã đơn hoặc trạng thái..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none"
        />
      </div>

      <div className="space-y-5">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md p-6 flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-[#3F3F3F]">Đơn hàng #{order.id}</p>
              <p className="text-sm text-gray-600">
                {order.products.length} sản phẩm • {order.order_date}
              </p>
              <p className="text-[#CDB38B] font-bold mt-1">
                {order.total.toLocaleString()} VND
              </p>
            </div>
            <select
              defaultValue={order.status}
              className={`px-4 py-2 rounded-xl font-medium ${
                order.status == "Đã giao"
                  ? "bg-green-100 text-green-700"
                  : order.status == "Đang xử lý"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <option>Đang xử lý</option>
              <option>Đã giao</option>
              <option>Đã hủy</option>
            </select>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}