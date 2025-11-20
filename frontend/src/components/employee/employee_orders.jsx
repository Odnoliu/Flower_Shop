import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { Package, Truck, Edit3, CheckCircle } from "lucide-react";

export default function EmployeeOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders([
      { id: 201, user: "Khách A", total: 250000, order_date: "2025-11-10", status: "Đang xử lý", address: "123 Đường A, Quận 1" },
      { id: 202, user: "Khách B", total: 420000, order_date: "2025-11-11", status: "Đang xử lý", address: "45 Đường B, Quận 3" },
      { id: 203, user: "Khách C", total: 150000, order_date: "2025-11-12", status: "Đã giao", address: "78 Đường C, Quận 7" },
    ]);
  }, []);

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id == id ? { ...o, status } : o));
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: `Đơn hàng #${id} đã chuyển sang "${status}"`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const editAddress = (id) => {
    const order = orders.find(o => o.id == id);
    Swal.fire({
      title: `<span class="text-violet-600 font-bold">Sửa địa chỉ giao hàng</span>`,
      input: "text",
      inputValue: order.address,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      inputValidator: (value) => !value && "Vui lòng nhập địa chỉ!"
    }).then(res => {
      if (res.isConfirmed) {
        setOrders(prev => prev.map(o => o.id == id ? { ...o, address: res.value } : o));
        Swal.fire({ icon: "success", title: "Đã cập nhật địa chỉ!", timer: 1500, showConfirmButton: false });
      }
    });
  };

  const statusConfig = {
    "Đang xử lý": { color: "bg-amber-100 text-amber-800 border-amber-300", icon: Package },
    "Đã giao": { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-violet-600 rounded-xl shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
              Quản Lý Đơn Hàng
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng nhanh chóng</p>
          </div>
        </div>

        <div className="grid gap-6">
          <AnimatePresence>
            {orders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-violet-600">#{order.id}</div>
                        <div>
                          <p className="font-semibold text-gray-800">{order.user}</p>
                          <p className="text-sm text-gray-500">{order.order_date}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full border font-medium flex items-center gap-2 ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-5 h-5" />
                        {order.status}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ giao</p>
                        <p className="font-medium text-gray-800">{order.address}</p>
                      </div>
                      <div className="flex items-end justify-end gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, "Đang xử lý")}
                          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          Đang xử lý
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, "Đã giao")}
                          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Đã giao
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => editAddress(order.id)}
                          className="p-3 bg-violet-100 text-violet-600 rounded-xl hover:bg-violet-200 transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}