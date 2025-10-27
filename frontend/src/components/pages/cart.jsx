import React from "react";
import { ShoppingCart } from "lucide-react";

export default function Cart() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-[#3F3F3F]">
      <ShoppingCart size={60} className="text-[#C07A00] mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn</h2>
      <p className="text-gray-600">Hiện tại chưa có sản phẩm nào trong giỏ.</p>
    </div>
  );
}
