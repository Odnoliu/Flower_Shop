import React, { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { exportToCSV } from "../../utils/export_utils";
import { OrderService, StatusService } from "../../services";

export default function StoreOwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const statusIdToName = useMemo(() => {
    const map = {};
    (statuses || []).forEach((s) => {
      const id = s.STATUS_Id ?? s.id;
      const name = s.STATUS_Name ?? s.name;
      if (id != null && name) map[id] = name;
    });
    return map;
  }, [statuses]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, statusRes] = await Promise.all([
        OrderService.list(),
        StatusService.list(),
      ]);

      const list = Array.isArray(orderRes)
        ? orderRes
        : orderRes && Array.isArray(orderRes.data)
        ? orderRes.data
        : orderRes && Array.isArray(orderRes.orders)
        ? orderRes.orders
        : [];

      const sts = Array.isArray(statusRes?.statuses)
        ? statusRes.statuses
        : Array.isArray(statusRes)
        ? statusRes
        : [];

      setOrders(list);
      setStatuses(sts);
    } catch (e) {
      console.warn("Không lấy được order/status từ API, dùng dữ liệu demo", e);
      setStatuses([
        { STATUS_Id: 1, STATUS_Name: "Đang xử lý" },
        { STATUS_Id: 2, STATUS_Name: "Đang giao hàng" },
        { STATUS_Id: 3, STATUS_Name: "Đã giao hàng" },
        { STATUS_Id: 4, STATUS_Name: "Đã hủy" },
      ]);
      setOrders([
        {
          ORDER_Id: 1,
          USER_Phone: "0123456789",
          ORDER_Total: 250000,
          ORDER_CreatedDate: "2025-11-10",
          STATUS_Id: 3,
        },
        {
          ORDER_Id: 2,
          USER_Phone: "0987654321",
          ORDER_Total: 350000,
          ORDER_CreatedDate: "2025-11-12",
          STATUS_Id: 1,
        },
        {
          ORDER_Id: 3,
          USER_Phone: "0900000000",
          ORDER_Total: 120000,
          ORDER_CreatedDate: "2025-11-14",
          STATUS_Id: 4,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const normalizeOrder = (o) => {
    const id = o.ORDER_Id ?? o.id;
    const customer = o.customer_name ?? o.USER_Phone ?? o.user_id ?? "Khách";
    const total =
      Number(
        o.ORDER_Total ?? o.total ?? o.amount ?? o.ORDER_TotalAmount ?? 0
      ) || 0;
    const dateRaw =
      o.ORDER_CreatedDate ??
      o.order_date ??
      o.created_at ??
      o.ORDER_Date ??
      null;

    const statusId = o.STATUS_Id ?? o.statusId ?? o.status;
    const statusName =
      o.STATUS_Name ?? o.status_name ?? statusIdToName[statusId] ?? "Không rõ";

    return {
      ...o,
      _id: id,
      _customer: customer,
      _total: total,
      _date: dateRaw,
      _status: statusName,
      _statusId: statusId,
    };
  };

  const normalizedOrders = useMemo(
    () => orders.map(normalizeOrder),
    [orders, statusIdToName]
  );

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return normalizedOrders;
    return normalizedOrders.filter(
      (o) =>
        String(o._statusId) == String(statusFilter) ||
        String(o._status) == String(statusFilter)
    );
  }, [normalizedOrders, statusFilter]);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const getStatusColor = (status) => {
    if (!status) {
      return "bg-gray-100 text-gray-800 border border-gray-200";
    }
    if (status.includes("Đã giao")) {
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    }
    if (status.includes("Đang giao")) {
      return "bg-blue-100 text-blue-800 border border-blue-200";
    }
    if (status.toLowerCase().includes("hủy")) {
      return "bg-red-100 text-red-800 border border-red-200";
    }
    if (status.includes("xử lý")) {
      return "bg-amber-100 text-amber-800 border border-amber-200";
    }
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };
  const isLockedStatusId = (statusId) => {
    const sid = Number(statusId);
    return sid == 3 || sid == 4;
  };
  const updateStatus = async (orderId, newStatusId) => {
    const statusIdNum = Number(newStatusId);
    if (!statusIdNum) return;

    const current = orders.find((o) => (o.ORDER_Id ?? o.id) == orderId);
    const currentStatusId = current
      ? current.STATUS_Id ?? current.statusId ?? current.status
      : null;

    if (isLockedStatusId(currentStatusId)) {
      Swal.fire(
        "Không thể cập nhật",
        "Đơn đã giao hoặc đã hủy, không thể thay đổi trạng thái.",
        "warning"
      );
      return;
    }

    const statusName = statusIdToName[statusIdNum] ?? "Không rõ";

    try {
      const raw = await OrderService.get(orderId);
      const order = raw && !raw.ORDER_Id && raw.order ? raw.order : raw;

      const payload = {
        USER_Phone: order.USER_Phone ?? order.userPhone ?? order.phone,
        STATUS_Id: statusIdNum,
      };

      await OrderService.update(orderId, payload);
      Swal.fire(
        "Thành công!",
        `Đã cập nhật trạng thái đơn #${orderId} thành "${statusName}"`,
        "success"
      );
      fetchOrders();
    } catch (e) {
      console.warn("Update status lỗi, fallback update local", e);
      setOrders((prev) =>
        prev.map((o) =>
          (o.ORDER_Id ?? o.id) == orderId
            ? { ...o, STATUS_Id: statusIdNum }
            : o
        )
      );
      Swal.fire(
        "Đã cập nhật (tạm thời)",
        `Trạng thái đơn #${orderId} đã thay đổi trên giao diện`,
        "success"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#5B4636]">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm text-[#8C7A64] mt-1">
            Xem, lọc và cập nhật trạng thái các đơn hàng của cửa hàng.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl text-sm border-[#F3E2C2] bg-white focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((s) => {
              const id = s.STATUS_Id ?? s.id;
              const name = s.STATUS_Name ?? s.name;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>

          <button
            onClick={() =>
              exportToCSV(normalizedOrders, "danh_sach_don_hang.csv")
            }
            className="flex items-center gap-2 px-5 py-3 bg-[#CDB38B] hover:bg-[#b49c74] text-white font-medium rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl shadow-lg overflow-hidden border border-[#F3E2C2]">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[#8C7A64] font-semibold text-sm bg-[#FFF3DF]">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Ngày đặt</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-6">
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
              ) : filteredOrders.length == 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Không có đơn hàng với trạng thái đã chọn
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const locked = isLockedStatusId(order._statusId);
                  return (
                    <tr
                      key={order._id}
                      className="bg-white hover:bg-[#FFF6E9] transition-all duration-200 shadow-sm hover:shadow-md rounded-2xl"
                    >
                      <td className="px-6 py-5 font-medium text-[#5B4636]">
                        #{order._id}
                      </td>
                      <td className="px-6 py-5 text-[#5B4636]">
                        {order._customer}
                      </td>
                      <td className="px-6 py-5 font-semibold text-emerald-600">
                        {formatPrice(order._total)}
                      </td>
                      <td className="px-6 py-5 text-[#5B4636]">
                        {order._date
                          ? format(new Date(order._date), "dd/MM/yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                            order._status
                          )}`}
                        >
                          {order._status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <select
                            value={order._statusId ?? ""}
                            onChange={(e) =>
                              updateStatus(order._id, e.target.value)
                            }
                            disabled={locked}
                            className={`px-3 py-2 border rounded-lg text-sm border-[#F3E2C2] bg-white focus:outline-none focus:ring-2 focus:ring-[#CDB38B] ${
                              locked ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            <option value="">-- Đổi trạng thái --</option>
                            {statuses.map((s) => {
                              const id = s.STATUS_Id ?? s.id;
                              const name = s.STATUS_Name ?? s.name;
                              return (
                                <option key={id} value={id}>
                                  {name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
