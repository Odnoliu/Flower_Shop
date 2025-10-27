import React, { useEffect, useState } from "react";
import api_client from "../../api/axios_client";

export default function Orders({ userId = 1 }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api_client.get(`/order?user_id=${userId}`).then((res) => setOrders(res.data));
  }, [userId]);

  return (
    <div className="p-8 text-[#3F3F3F]">
      <h2 className="text-2xl font-semibold mb-6">Đơn hàng của bạn</h2>
      {orders.length === 0 ? (
        <p>Không có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-[#FFF3DA] p-4 rounded-2xl shadow flex justify-between"
            >
              <div>
                <p>Mã đơn: <strong>#{o.id}</strong></p>
                <p>Ngày đặt: {o.order_date}</p>
                <p>Trạng thái: <span className="text-[#C07A00]">{o.status}</span></p>
              </div>
              <div className="text-right font-semibold text-[#C07A00]">
                {o.total.toLocaleString()}₫
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
