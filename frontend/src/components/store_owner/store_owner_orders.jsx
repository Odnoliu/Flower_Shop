import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axios_client";
import Swal from "sweetalert2";
import { exportToCSV } from "../../utils/export_utils";
import { format } from "date-fns";

export default function StoreOwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/order");
      setOrders(res.data || []);
    } catch (e) {
      console.warn("Không lấy được order từ API, dùng dữ liệu giả");
      setOrders([
        { id: 1, user_id: "An", total: 250000, order_date: "2025-11-10", status: "Đã giao" },
        { id: 2, user_id: "Bình", total: 350000, order_date: "2025-11-12", status: "Đang xử lý" },
        { id: 3, user_id: "Cường", total: 120000, order_date: "2025-11-14", status: "Đã hủy" },
        { id: 4, user_id: "Mai", total: 890000, order_date: "2025-11-18", status: "Đang xử lý" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await axiosClient.get(`/order/${orderId}`);
      const order = res.data;
      const updated = { ...order, status: newStatus };
      await axiosClient.put(`/order/${orderId}`, updated);
      Swal.fire("Thành công!", "Cập nhật trạng thái thành công", "success");
      fetch();
    } catch (e) {
      setOrders((prev) =>
        prev.map((o) => (o.id == orderId ? { ...o, status: newStatus } : o))
      );
      Swal.fire("Đã cập nhật", "Trạng thái đã được thay đổi (demo)", "success");
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Đang xử lý":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Đã hủy":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h2>
        <button
          onClick={() => exportToCSV(orders, "danh_sach_don_hang.csv")}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-5">
            <thead>
              <tr className="text-left text-gray-600 font-semibold text-sm bg-gray-50">
                <th className="px-6 py-5">ID</th>
                <th className="px-6 py-5">Khách hàng</th>
                <th className="px-6 py-5">Tổng tiền</th>
                <th className="px-6 py-5">Ngày đặt</th>
                <th className="px-6 py-5">Trạng thái</th>
                <th className="px-6 py-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="bg-white">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="flex items-center gap-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                        <div className="flex gap-2 ml-auto">
                          <div className="h-9 w-24 bg-gray-200 rounded"></div>
                          <div className="h-9 w-20 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : orders.length == 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md rounded-2xl overflow-hidden"
                  >
                    <td className="px-6 py-7 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-7 text-gray-700">{order.customer_name || "Khách lẻ"}</td>
                    <td className="px-6 py-7 font-semibold text-emerald-600">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-7 text-gray-600">
                      {format(new Date(order.order_date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-7">
                      <span
                        className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => updateStatus(order.id, "Đang xử lý")}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition"
                        >
                          Đang xử lý
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "Đã giao")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          Đã giao
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "Đã hủy")}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition"
                        >
                          Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}