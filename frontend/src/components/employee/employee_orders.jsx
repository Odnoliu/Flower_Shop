import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import OrderService from "../../services/order.service";
import StatusService from "../../services/status.service";
import OrderDetailService from "../../services/order_detail.service";
import ProductService from "../../services/product.service";

const STATUS_STEPS = [
  "Đang chờ xử lý",
  "Đang xử lý",
  "Đang giao hàng",
  "Đã giao hàng",
  "Đã hủy",
];

function StatusTimeline({ current }) {
  const idx = STATUS_STEPS.findIndex((s) =>
    current.toLowerCase().includes(s.split(" ")[1].toLowerCase())
  );
  const activeIndex = idx == -1 ? 0 : idx;

  return (
    <div className="flex flex-col gap-2 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= activeIndex && !step.includes("hủy");
        const isCurrent = i == activeIndex;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                step.includes("hủy")
                  ? "bg-red-400"
                  : done
                  ? "bg-emerald-500"
                  : "bg-gray-300"
              }`}
            />
            <span
              className={`text-sm ${
                isCurrent ? "font-semibold text-[#3F3F3F]" : "text-gray-500"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EmployeeOrders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailProductMap, setDetailProductMap] = useState({});
  const [detailModal, setDetailModal] = useState({
    open: false,
    order: null,
    items: [],
  });

  const statusIdToName = useMemo(() => {
    const map = {};
    (statuses || []).forEach((s) => {
      const id = s.STATUS_Id ?? s.id;
      const name = s.STATUS_Name ?? s.name;
      if (id != null) map[id] = name;
    });
    return map;
  }, [statuses]);

  const statusNameToId = useMemo(() => {
    const map = {};
    (statuses || []).forEach((s) => {
      const id = s.STATUS_Id ?? s.id;
      const name = s.STATUS_Name ?? s.name;
      if (id != null && name) map[name] = id;
    });
    return map;
  }, [statuses]);

  const fetchStatuses = async () => {
    try {
      const res = await StatusService.list();
      const list = Array.isArray(res?.statuses)
        ? res.statuses
        : Array.isArray(res)
        ? res
        : [];
      setStatuses(list);
    } catch (err) {
      console.warn("Không lấy được danh sách trạng thái", err);
      setStatuses([]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await OrderService.list();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.orders)
        ? res.orders
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setOrders(list);
    } catch (err) {
      console.warn("Không lấy được đơn hàng", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchOrders();
  }, []);

  const normalizeStatusName = (order) => {
    const sid = order.STATUS_Id ?? order.statusId ?? order.status;
    const raw = statusIdToName[sid] ?? order.STATUS_Name ?? order.status ?? "";
    if (!raw) return "Không rõ";
    return raw;
  };

  const getStatusConfig = (name) => {
    if (!name)
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock,
      };
    if (name.includes("Đang giao")) {
      return {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Truck,
      };
    }
    if (name.includes("Đã giao")) {
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: CheckCircle,
      };
    }
    if (name.toLowerCase().includes("hủy")) {
      return { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle };
    }
    return {
      color: "bg-amber-100 text-amber-800 border-amber-300",
      icon: Clock,
    };
  };
  const isLockedStatus = (order) => {
    const sid = order.STATUS_Id ?? order.statusId ?? order.status;
    return sid == 3 || sid == 4;
  };
  const updateStatus = async (order, nextStatusName) => {
    if (isLockedStatus(order)) {
      Swal.fire(
        "Không thể cập nhật",
        "Đơn đã giao hoặc đã hủy, không thể thay đổi trạng thái.",
        "warning"
      );
      return;
    }
    const orderId = order.ORDER_Id ?? order.id;
    const statusId = statusNameToId[nextStatusName] ?? order.STATUS_Id;

    if (!orderId || !statusId) {
      Swal.fire("Lỗi", "Thiếu thông tin ORDER_Id hoặc STATUS_Id", "error");
      return;
    }

    try {
      await OrderService.update(orderId, {
        USER_Phone: order.USER_Phone ?? order.userPhone ?? order.phone,
        STATUS_Id: statusId,
      });
      setOrders((prev) =>
        prev.map((o) =>
          (o.ORDER_Id ?? o.id) == orderId ? { ...o, STATUS_Id: statusId } : o
        )
      );
      Swal.fire(
        "Thành công!",
        `Đã cập nhật trạng thái đơn #${orderId}`,
        "success"
      );
    } catch (err) {
      console.error("updateStatus error", err);
      Swal.fire("Lỗi", "Không cập nhật được trạng thái đơn hàng", "error");
    }
  };

  const pendingOrders = useMemo(
    () =>
      orders.filter((o) => {
        const name = normalizeStatusName(o);
        return name.includes("Đang xử lý");
      }),
    [orders, statusIdToName]
  );

  const openDetail = async (order) => {
    const id = order.ORDER_Id ?? order.id;
    if (!id) return;

    try {
      const res = await OrderDetailService.listByOrder(id);
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.details)
        ? res.details
        : [];

      const ids = [
        ...new Set(
          items
            .map((it) => it.PRODUCT_Id ?? it.product_id)
            .filter((v) => v != null)
        ),
      ];

      const map = {};
      for (const pid of ids) {
        try {
          const p = await ProductService.get(pid);
          const name = p[0].PRODUCT_Name ?? p.name ?? `Sản phẩm #${pid}`;
          const image = p[0].PRODUCT_Avatar ?? p.image ?? "/placeholder.jpg";

          map[pid] = { ...p, id: pid, name, image };
        } catch (err) {
          console.warn("Không lấy được sản phẩm", pid, err);
        }
      }

      setDetailProductMap(map);
      setDetailModal({
        open: true,
        order,
        items,
      });
    } catch (err) {
      console.error("load order detail error", err);
      setDetailProductMap({});
      setDetailModal({
        open: true,
        order,
        items: [],
      });
    }
  };

  const closeDetail = () => {
    setDetailModal({
      open: false,
      order: null,
      items: [],
    });
    setDetailProductMap({});
  };

  const moneyFmt = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v || 0);

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CDB38B] rounded-xl shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3F3F3F]">
                Quản lý đơn hàng (Nhân viên)
              </h1>
              <p className="text-gray-600 mt-1">
                Xử lý đơn mới, xác nhận thanh toán và cập nhật trạng thái giao
                hàng.
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="self-start px-4 py-2 rounded-xl border border-[#E8DAB5] bg-white text-sm font-medium hover:bg-[#FFF3DD]"
          >
            Tải lại danh sách
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow border border-[#E8DAB5] p-4">
            <p className="text-sm text-gray-500">Đơn đang chờ xử lý</p>
            <p className="text-3xl font-bold text-[#CDB38B]">
              {pendingOrders.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow border border-[#E8DAB5] p-4">
            <p className="text-sm text-gray-500">Tổng số đơn</p>
            <p className="text-3xl font-bold text-[#3F3F3F]">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow border border-[#E8DAB5] p-4">
            <p className="text-sm text-gray-500">Trạng thái hệ thống</p>
            <p className="text-base font-semibold text-emerald-600">
              {loading ? "Đang tải..." : "Hoạt động bình thường"}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <AnimatePresence>
            {orders.map((order, index) => {
              const id = order.ORDER_Id ?? order.id;
              const created =
                order.ORDER_CreatedDate ??
                order.order_date ??
                order.created_at ??
                "";
              const total =
                Number(order.ORDER_Total ?? order.total ?? order.amount ?? 0) ||
                0;
              const phone =
                order.USER_Phone ?? order.userPhone ?? order.phone ?? "N/A";
              const locked = isLockedStatus(order);
              const statusName = normalizeStatusName(order);
              const cfg = getStatusConfig(statusName);
              const StatusIcon = cfg.icon;

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-xl border border-[#F0E2C4] overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-[#CDB38B]">
                          #{id}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Khách: {phone}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ngày tạo: {created}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full border font-medium flex items-center gap-2 ${cfg.color}`}
                      >
                        <StatusIcon className="w-5 h-5" />
                        {statusName}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {moneyFmt(total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium text-gray-800">{phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStatus(order, "Đang xử lý")}
                            disabled={locked}
                            className={`px-3 py-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-200 text-xs font-medium ${
                              locked ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Đang xử lý
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              updateStatus(order, "Đang giao hàng")
                            }
                            disabled={locked}
                            className={`px-3 py-2 bg-blue-100 text-blue-800 rounded-xl border border-blue-200 text-xs font-medium flex items-center gap-1 ${
                              locked ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                            Đang giao
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStatus(order, "Đã giao hàng")}
                            disabled={locked}
                            className={`px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-medium flex items-center gap-1 ${
                              locked ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Đã giao
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStatus(order, "Đã hủy")}
                            disabled={locked}
                            className={`px-3 py-2 bg-red-100 text-red-800 rounded-xl border border-red-200 text-xs font-medium flex items-center gap-1 ${
                              locked ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đơn
                          </motion.button>
                        </div>
                        <button
                          onClick={() => openDetail(order)}
                          className="text-xs mt-2 text-blue-600 hover:underline"
                        >
                          Xem chi tiết & timeline
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!loading && orders.length == 0 && (
            <div className="text-center text-gray-500 py-12">
              Hiện chưa có đơn hàng nào.
            </div>
          )}
        </div>
      </motion.div>

      {detailModal.open && detailModal.order && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-[#3F3F3F]">
                Chi tiết đơn hàng #
                {detailModal.order.ORDER_Id ?? detailModal.order.id}
              </h2>
              <button
                onClick={closeDetail}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Đóng
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Trạng thái:{" "}
              <span className="font-semibold">
                {normalizeStatusName(detailModal.order)}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Ngày tạo:{" "}
              {detailModal.order.ORDER_CreatedDate ??
                detailModal.order.order_date ??
                detailModal.order.created_at}
            </p>

            <StatusTimeline current={normalizeStatusName(detailModal.order)} />

            <div className="mt-4 border-t border-[#E8DAB5] pt-3">
              <p className="font-semibold mb-2 text-[#3F3F3F]">
                Sản phẩm trong đơn
              </p>
              {detailModal.items.length == 0 ? (
                <p className="text-sm text-gray-500">
                  Không có dữ liệu chi tiết (hoặc chưa load được).
                </p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-auto">
                  {detailModal.items.map((it) => {
                    console.log(it)
                    const pid = it.PRODUCT_Id ?? it.product_id;
                    const info = detailProductMap[pid] || {};
                    const name =
                      info.name ??
                      it.PRODUCT_Name ??
                      it.name ??
                      `Sản phẩm ${pid}`;
                    const imgSrc = info.image ?? "/placeholder.jpg";

                    const qty = it.ORDERDETAIL_Quantity ?? it.quantity ?? 1;
                    const price =
                      Number(it.ORDERDETAIL_Price ?? it.price ?? 0) || 0;

                    return (
                      <li
                        key={pid}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={imgSrc}
                            alt={name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E8DAB5]"
                          />
                          <div>
                            <p className="font-medium text-[#3F3F3F]">{name}</p>
                            <p className="text-gray-500">x{qty}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[#CDB38B]">
                          {moneyFmt(price * qty)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
