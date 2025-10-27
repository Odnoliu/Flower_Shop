import React, { useEffect, useState } from "react";
import api_client from "../../api/axios_client";
import { motion } from "framer-motion";

export default function HomePage() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api_client.get("/shop_info").then((res) => setShop(res.data));
    api_client.get("/products?_limit=3").then((res) => setProducts(res.data));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-[#3F3F3F]">
      {shop && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-[#C07A00] mb-2">
            {shop.name}
          </h1>
          <p className="italic text-lg mb-6">{shop.slogan}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-10 w-full max-w-5xl">
        {products.map((p) => (
          <motion.div
            key={p.id}
            className="bg-[#FFF3DA] rounded-2xl p-4 shadow-md text-center hover:shadow-lg transition"
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-48 object-cover rounded-xl mb-3"
            />
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
            <p className="text-[#C07A00] font-bold mt-2">{p.price.toLocaleString()}₫</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
