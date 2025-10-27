import React, { useEffect, useState } from "react";
import api_client from "../../api/axios_client";

export default function History({ userId = 1 }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api_client.get(`/order?user_id=${userId}`).then((res) => setOrders(res.data));
  }, [userId]);

  const completed = orders.filter((o) => o.status === "Đã giao" || o.status === "Đã hủy");

  return (
    <div className="p-8 text-[#3F3F3F]">
      <h2 className="text-2xl font-semibold mb-6">Lịch sử mua hàng</h2>
      {completed.length === 0 ? (
        <p>Không có lịch sử giao dịch.</p>
      ) : (
        <div className="space-y-4">
          {completed.map((o) => (
            <div
              key={o.id}
              className="bg-[#FFF9F0] p-4 rounded-2xl shadow-md border border-[#CDB38B]"
            >
              <p className="font-semibold">Mã đơn #{o.id}</p>
              <p>Ngày đặt: {o.order_date}</p>
              <p>Trạng thái: <span className="text-[#C07A00]">{o.status}</span></p>
              <p>Tổng: {o.total.toLocaleString()}₫</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
