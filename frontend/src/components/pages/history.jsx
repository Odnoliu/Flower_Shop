import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Package, Calendar } from "lucide-react";
import OrderService from "../../services/order.service";
import StatusService from "../../services/status.service";
import AddressService from "../../services/address.service";
import CityService from "../../services/city.service";
import WardService from "../../services/ward.service";

export default function History() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);

  const statusIdToName = useMemo(() => {
    const map = {};
    (statuses || []).forEach((s) => {
      const id = s.STATUS_Id ?? s.id;
      const name = s.STATUS_Name ?? s.name;
      if (id != null) map[id] = name;
    });
    return map;
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
        const [orderRes, statusRes, addrRes, cityRes, wardRes] =
          await Promise.all([
            OrderService.list(),
            StatusService.list(),
            AddressService.list(),
            CityService.listCities(),
            WardService.list(),
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
      } catch (err) {
        console.error("fetch history error", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => {
      const sid = o.STATUS_Id ?? o.statusId ?? o.status;
      const name = statusIdToName[sid] ?? o.STATUS_Name ?? o.status ?? "";
      return name.includes("Đã giao");
    });
  }, [orders, statusIdToName]);

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
        Lịch sử mua hàng
      </h1>

      {loading && (
        <div className="text-gray-500 text-sm mb-4">Đang tải dữ liệu...</div>
      )}

      <div className="space-y-6">
        {!loading && deliveredOrders.length == 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 py-8"
          >
            Bạn chưa có đơn hàng đã giao nào.
          </motion.div>
        ) : (
          deliveredOrders.map((order, i) => {
            const id = order.ORDER_Id ?? order.id;
            const date =
              order.ORDER_CreatedDate ?? order.order_date ?? order.created_at;
            const total = Number(order.ORDER_Total ?? order.total ?? 0) || 0;
            const sid = order.STATUS_Id ?? order.statusId ?? order.status;
            const statusName =
              statusIdToName[sid] ?? order.STATUS_Name ?? order.status ?? "";
            const address = resolveAddressForOrder(order);

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-[#3F3F3F]">
                      Đơn hàng #{id}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={16} />
                      {date}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    {statusName || "Đã giao hàng"}
                  </span>
                </div>

                <p className="text-[#CDB38B] font-bold">{moneyFmt(total)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Giao đến: {address}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.main>
  );
}
