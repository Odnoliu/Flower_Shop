import React, { useEffect, useMemo, useState, useCallback } from "react";
import axiosClient from "../../api/axios_client";
import { exportToCSV, exportToJSON } from "../../utils/export_utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function StoreOwnerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/order");
      setOrders(res.data || []);
    } catch (err) {
      console.warn("API lỗi, dùng dữ liệu giả:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const dailyRevenue = useMemo(() => {
    if (!orders || orders.length == 0) {
      const today = new Date();
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString().slice(0, 10),
          revenue: Math.round(500000 + Math.random() * 2000000),
          orders: Math.round(5 + Math.random() * 20),
        };
      });
    }
    const map = {};
    orders.forEach((o) => {
      const date = o.order_date ? o.order_date.slice(0, 10) : "unknown";
      map[date] = map[date] || { revenue: 0, orders: 0 };
      map[date].revenue += Number(o.total) || 0;
      map[date].orders += 1;
    });
    return Object.entries(map)
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders]);

  const statusSummary = useMemo(() => {
    if (!orders || orders.length == 0) {
      return [
        { status: "Đang xử lý", count: 12 },
        { status: "Đã giao", count: 35 },
        { status: "Đã hủy", count: 3 },
      ];
    }
    const sMap = {};
    orders.forEach((o) => {
      const s = o.status || "Chưa xác định";
      sMap[s] = (sMap[s] || 0) + 1;
    });
    return Object.entries(sMap).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    return { totalRevenue, totalOrders, byStatus };
  }, [orders]);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Báo cáo & Thống kê</h2>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => exportToCSV(orders, "orders_report.csv")}>Export CSV</button>
          <button className="px-3 py-2 bg-gray-600 text-white rounded" onClick={() => exportToJSON(orders, "orders_report.json")}>Export JSON</button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Tổng doanh thu</div>
          <div className="text-2xl font-bold">{new Intl.NumberFormat("vi-VN", {style:"currency",currency:"VND", maximumFractionDigits:0}).format(summary.totalRevenue || dailyRevenue.reduce((s,i)=>s+i.revenue,0))}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Tổng đơn</div>
          <div className="text-2xl font-bold">{summary.totalOrders || dailyRevenue.reduce((s,i)=>s+i.orders,0)}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="mt-2 space-y-1">
            {statusSummary.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="text-sm">{s.status}</div>
                <div className="font-semibold">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-3">Doanh thu (7 ngày)</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#FF6B94" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-3">Đơn theo trạng thái</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={statusSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 bg-white rounded shadow p-4">
        <h3 className="font-medium mb-2">Danh sách đơn (mẫu)</h3>
        {loading ? <div>Đang tải...</div> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-center">ID</th>
                  <th>Ngày</th>
                  <th>Khách hàng</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(orders.length ? orders : dailyRevenue.map((d, i) => ({
                  id: i + 1,
                  order_date: d.date,
                  user_id: "demo",
                  total: d.revenue,
                  status: i % 3 == 0 ? "Đã giao" : "Đang xử lý"
                }))).map(o => (
                  <tr key={o.id} className="text-center">
                    <td>{o.id}</td>
                    <td>{o.order_date}</td>
                    <td>{o.customer_name}</td>
                    <td>{new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND", maximumFractionDigits:0}).format(o.total)}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
