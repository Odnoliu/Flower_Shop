import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axios_client";
import { motion } from "framer-motion";
import { ShoppingCart, Info } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { isOpen } = useSidebar();

  useEffect(() => {
    axiosClient
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <motion.main
      animate={{
        marginLeft: isOpen ? 220 : 80,
        width: isOpen ? "calc(100% - 220px)" : "calc(100% - 80px)",
        scale: isOpen ? 1 : 0.98,
      }}
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F]">
        🌸 Danh sách sản phẩm
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col"
          >
            <img
              src={p.image}
              alt={p.name}
              className="h-48 w-full object-cover rounded-xl mb-3"
            />
            <h3 className="text-lg font-semibold text-[#3F3F3F]">{p.name}</h3>
            <p className="text-sm text-gray-500 flex-grow mt-1">
              {p.category || "Hoa tươi"}
            </p>
            <p className="text-[#CDB38B] font-bold mt-2">
              {p.price.toLocaleString()} VND
            </p>

            <div className="flex justify-between mt-4">
              <button className="flex items-center gap-2 bg-[#CDB38B] text-white py-2 px-3 rounded-xl hover:bg-[#B8976D] transition">
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
              <button className="flex items-center gap-2 border border-[#CDB38B] text-[#CDB38B] py-2 px-3 rounded-xl hover:bg-[#CDB38B] hover:text-white transition">
                <Info size={18} /> Chi tiết
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}
