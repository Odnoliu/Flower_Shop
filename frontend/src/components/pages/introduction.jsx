import React from "react";
import { motion } from "framer-motion";
import { Leaf, Users, Award } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

export default function Introduction() {
  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-8 text-[#3F3F3F]">Giới thiệu Hales Flower Shop</h1>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src="/src/assets/shop_front.jpg"
          alt="Cửa hàng"
          className="rounded-2xl shadow-lg"
        />
        <div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Hales Flower Shop ra đời năm 2020 với sứ mệnh mang thiên nhiên xanh tươi đến từng góc nhỏ của thành phố. 
            Mỗi bó hoa đều được đội ngũ nghệ nhân tỉ mỉ chăm chút, kết hợp giữa vẻ đẹp cổ điển và phong cách hiện đại.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Leaf, title: "Nguồn gốc rõ ràng", desc: "Hoa nhập trực tiếp từ vườn Đà Lạt & Hà Lan" },
          { icon: Users, title: "Đội ngũ 20+ nghệ nhân", desc: "10 năm kinh nghiệm cắm hoa sự kiện" },
          { icon: Award, title: "Giải thưởng 2024", desc: "Shop hoa đẹp nhất TP.HCM" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E8DAB5] rounded-2xl p-8 text-center shadow-md"
          >
            <item.icon size={56} className="mx-auto mb-4 text-[#CDB38B]" />
            <h3 className="font-bold text-[#3F3F3F] mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}