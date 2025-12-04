import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import OrderService from "../../services/order.service";
import StatusService from "../../services/status.service";
import OrderDetailService from "../../services/order_detail.service";
import AddressService from "../../services/address.service";
import CityService from "../../services/city.service";
import WardService from "../../services/ward.service";
import ProductService from "../../services/product.service";

const STATUS_STEPS = [
  "Đang chờ xử lý",
  "Đang xử lý",
  "Đang giao hàng",
  "Đã giao hàng",
  "Đã hủy",
];

function StatusTimeline({ current }) {
  const lower = (current || "").toLowerCase();
  let activeIndex = 0;
  STATUS_STEPS.forEach((step, i) => {
    const token = step.split(" ")[1] || step;
    if (lower.includes(token.toLowerCase())) {
      activeIndex = i;
    }
  });

  return (
    <div className="flex flex-col gap-2 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= activeIndex && !step.includes("hủy");
        const isCurrent = i === activeIndex;
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [productIdToInfo, setProductIdToInfo] = useState({});
  const [detailModal, setDetailModal] = useState({
    open: false,
    order: null,
    items: [],
  });

  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);
  const [products, setProducts] = useState([]);

  const location = useLocation();
  const highlightOrderId = location.state?.highlightOrderId ?? null;

  const statusIdToName = useMemo(() => {
    const map = {};
    (statuses || []).forEach((s) => {
      const id = s.STATUS_Id ?? s.id;
      const name = s.STATUS_Name ?? s.name;
      if (id != null) map[id] = name;
    });
    return map;
  }, [statuses]);

  const deliveredStatusId = useMemo(() => {
    const s = (statuses || []).find((x) => {
      const name = x.STATUS_Name ?? x.name ?? "";
      return name.includes("Đã giao");
    });
    return s ? s.STATUS_Id ?? s.id : null;
  }, [statuses]);

  const cityIdToName = useMemo(() => {
    const m = {};
    (cities || []).forEach((c) => {
      const id = c.CITY_Id ?? c.id;
      const name = c.CITY_Name ?? c.name;
      if (id != null) m[id] = name;
    });
    return m;
  }, [cities]);

  const wardIdToName = useMemo(() => {
    const m = {};
    (wards || []).forEach((w) => {
      const id = w.WARD_Id ?? w.id;
      const name = w.WARD_Name ?? w.name;
      if (id != null) m[id] = name;
    });
    return m;
  }, [wards]);

  const phoneToAddress = useMemo(() => {
    const m = {};
    (addresses || []).forEach((a) => {
      const phone = a.USER_Phone ?? a.user_phone ?? a.phone;
      const cityName = cityIdToName[a.CITY_Id ?? a.city_id] ?? "";
      const wardName = wardIdToName[a.WARD_Id ?? a.ward_id] ?? "";
      const specific = a.ADDRESS_Specific ?? a.specific ?? "";
      const full = [specific, wardName, cityName].filter(Boolean).join(", ");
      if (phone && full && !m[phone]) {
        m[phone] = full;
      }
    });
    return m;
  }, [addresses, cityIdToName, wardIdToName]);

useEffect(() => {
  if (!products || products.length === 0) {
    setProductIdToInfo({});
    return;
  }

  const load = async () => {
    const map = {};

    for (const p of products) {
      const id = p.PRODUCT_Id ?? p.id;
      if (!id) continue;

      let detail = {};
      try {
        detail = await ProductService.get(id);
      } catch (err) {
        console.warn("get product failed", id, err);
      }

      const name =
        detail.PRODUCT_Name ??
        p.PRODUCT_Name ??
        p.name ??
        `Sản phẩm #${id}`;

      const image =
        detail.PRODUCT_Avatar ??
        p.PRODUCT_Avatar ??
        p.image ??
        "/placeholder.jpg";

      map[id] = {
        ...p,
        ...detail,
        id,
        name,
        image,
      };
    }

    setProductIdToInfo(map);
  };

  load();
}, [products]);


  const resolveStatusName = (order) => {
    const sid = order.STATUS_Id ?? order.statusId ?? order.status;
    return statusIdToName[sid] ?? order.STATUS_Name ?? order.status ?? "Đang xử lý";
  };

  const moneyFmt = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v || 0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          orderRes,
          statusRes,
          addrRes,
          cityRes,
          wardRes,
          productRes,
        ] = await Promise.all([
          OrderService.list(),
          StatusService.list(),
          AddressService.list(),
          CityService.listCities(),
          WardService.list(),
          ProductService.list(),
        ]);

        const sts = Array.isArray(statusRes?.statuses)
          ? statusRes.statuses
          : Array.isArray(statusRes)
          ? statusRes
          : [];
        setStatuses(sts);

        const list = Array.isArray(orderRes)
          ? orderRes
          : Array.isArray(orderRes?.orders)
          ? orderRes.orders
          : Array.isArray(orderRes?.data)
          ? orderRes.data
          : [];
        setOrders(list);

        const addrList = Array.isArray(addrRes?.addresses)
          ? addrRes.addresses
          : Array.isArray(addrRes)
          ? addrRes
          : [];
        setAddresses(addrList);

        const cityList = Array.isArray(cityRes?.cities)
          ? cityRes.cities
          : Array.isArray(cityRes)
          ? cityRes
          : [];
        setCities(cityList);

        const wardList = Array.isArray(wardRes?.wards)
          ? wardRes.wards
          : Array.isArray(wardRes)
          ? wardRes
          : [];
        setWards(wardList);

        const prodList = Array.isArray(productRes)
          ? productRes
          : Array.isArray(productRes?.products)
          ? productRes.products
          : [];
        setProducts(prodList);
      } catch (err) {
        console.error("fetch orders error", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const id = o.ORDER_Id ?? o.id;
      const statusName = resolveStatusName(o);
      const term = (search || "").toLowerCase();
      return (
        id?.toString().includes(term) ||
        statusName.toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusIdToName]);

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
      setDetailModal({
        open: true,
        order,
        items,
      });
    } catch (err) {
      console.error("load order detail error", err);
      setDetailModal({
        open: true,
        order,
        items: [],
      });
    }
  };

  const closeDetail = () =>
    setDetailModal({
      open: false,
      order: null,
      items: [],
    });

  const confirmDelivered = async (order) => {
    if (!deliveredStatusId) return;
    const orderId = order.ORDER_Id ?? order.id;
    const phone = order.USER_Phone ?? order.user_phone ?? order.phone;

    const result = await Swal.fire({
      title: "Xác nhận đã nhận hàng?",
      text: `Bạn xác nhận đơn #${orderId} đã được giao thành công.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đã nhận hàng",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    try {
      await OrderService.update(orderId, {
        USER_Phone: phone,
        STATUS_Id: deliveredStatusId,
      });
      Swal.fire("Thành công", "Cảm ơn bạn đã xác nhận.", "success");
      setOrders((prev) =>
        prev.map((o) =>
          (o.ORDER_Id ?? o.id) == orderId
            ? { ...o, STATUS_Id: deliveredStatusId }
            : o
        )
      );
    } catch (err) {
      console.error("Confirm delivered error", err);
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái. Thử lại sau.", "error");
    }
  };

  const resolveAddressForOrder = (order) => {
    const phone = order.USER_Phone ?? order.user_phone ?? order.phone;
    return phoneToAddress[phone] ?? "Chưa có địa chỉ giao hàng";
  };

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F] flex items-center gap-3">
        <Package size={36} className="text-[#CDB38B]" />
        Đơn hàng của tôi
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

      {loading && (
        <div className="text-gray-500 text-sm mb-4">Đang tải dữ liệu...</div>
      )}

      <div className="space-y-5">
        {!loading && filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">Bạn chưa có đơn hàng nào.</div>
        ) : (
          filtered.map((order, i) => {
            const id = order.ORDER_Id ?? order.id;
            const created =
              order.ORDER_CreatedDate ?? order.order_date ?? order.created_at;
            const total = Number(order.ORDER_Total ?? order.total ?? 0) || 0;
            const statusName = resolveStatusName(order);
            const isHighlight =
              highlightOrderId && `${highlightOrderId}` === `${id}`;
            const address = resolveAddressForOrder(order);

            const statusColor =
              statusName.includes("Đã giao")
                ? "bg-green-100 text-green-700"
                : statusName.includes("Đang giao")
                ? "bg-blue-100 text-blue-700"
                : statusName.toLowerCase().includes("hủy")
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700";

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white border border-[#E8DAB5] rounded-2xl shadow-md p-6 flex justify-between items-center gap-4 ${
                  isHighlight ? "ring-2 ring-[#CDB38B]" : ""
                }`}
              >
                <div>
                  <p className="font-bold text-[#3F3F3F]">Đơn hàng #{id}</p>
                  <p className="text-sm text-gray-600">
                    Ngày tạo: {created}
                  </p>
                  <p className="text-sm text-gray-600">
                    Giao đến: {address}
                  </p>
                  <p className="text-[#CDB38B] font-bold mt-1">
                    {moneyFmt(total)}
                  </p>
                  <div className="flex gap-3 mt-2 items-center flex-wrap">
                    <button
                      onClick={() => openDetail(order)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                    {statusName.includes("Đang giao") && (
                      <button
                        onClick={() => confirmDelivered(order)}
                        className="text-sm px-3 py-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                      >
                        Xác nhận đã nhận
                      </button>
                    )}
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-xl font-medium text-sm ${statusColor}`}
                >
                  {statusName || "Đang xử lý"}
                </span>
              </motion.div>
            );
          })
        )}
      </div>

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
                {resolveStatusName(detailModal.order)}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Ngày tạo:{" "}
              {detailModal.order.ORDER_CreatedDate ??
                detailModal.order.order_date ??
                detailModal.order.created_at}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Giao đến: {resolveAddressForOrder(detailModal.order)}
            </p>

            <StatusTimeline
              current={resolveStatusName(detailModal.order)}
            />

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
                  {detailModal.items.map((it, idx) => {
                    const pid = it.PRODUCT_Id ?? it.product_id;
                    const prod = productIdToInfo[pid] || {};
                    console.log(prod)
                    const name =
                      prod.PRODUCT_Name ??
                      it.PRODUCT_Name ??
                      it.name ??
                      `Sản phẩm ${pid}`;
                    const qty =
                      it.ORDERDETAIL_Quantity ?? it.quantity ?? 1;
                    const price =
                      Number(it.ORDERDETAIL_Price ?? it.price ?? prod.price ?? 0) ||
                      0;
                    return (
                      <li
                        key={pid ?? idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {prod.PRODUCT_Avatar && (
                            <img
                              src={prod.PRODUCT_Avatar}
                              alt={name}
                              className="w-10 h-10 rounded-lg object-cover border border-[#E8DAB5]"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#3F3F3F]">
                              {name}
                            </p>
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
    </motion.main>
  );
}
