import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axios_client";
import { motion } from "framer-motion";
import { ShoppingCart, Info } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";
import { useCart } from "../../context/cart_context";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { setActivePage } = useSidebar();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  useEffect(() => {
    setActivePage("Sản phẩm");
  }, [setActivePage]);
  useEffect(() => {
    axiosClient
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleAdd = (e, product) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") == "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const imgEl = e.currentTarget.closest(".product-card")?.querySelector("img");
    if (!imgEl) {
      addToCart(product, 1);
      return;
    }

    const clone = imgEl.cloneNode(true);
    const rect = imgEl.getBoundingClientRect();
    clone.style.position = "fixed";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.zIndex = 9999;
    clone.style.borderRadius = "12px";
    document.body.appendChild(clone);

    const target = document.querySelector("#sidebar-cart-icon");
    const targetRect = target ? target.getBoundingClientRect() : { left: window.innerWidth - 80, top: 20 };

    gsap.to(clone, {
      duration: 0.9,
      left: targetRect.left + (targetRect.width / 2) - (rect.width / 6),
      top: targetRect.top + (targetRect.height / 2) - (rect.height / 6),
      width: rect.width * 0.3,
      height: rect.height * 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.removeChild(clone);
        addToCart(product, 1);
        if (target) {
          gsap.fromTo(target, { scale: 1 }, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1 });
        }
      }
    });
  };

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F]">
        Danh sách sản phẩm
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, index) => (
          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }} className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col product-card">
            <img src={p.image} alt={p.name} className="h-48 w-full object-cover rounded-xl mb-3" />
            <h3 className="text-lg font-semibold text-[#3F3F3F]">{p.name}</h3>
            <p className="text-sm text-gray-500 flex-grow mt-1">{p.category || "Hoa tươi"}</p>
            <p className="text-[#CDB38B] font-bold mt-2">{p.price.toLocaleString()} VND</p>

            <div className="flex justify-between mt-4">
              <button className="flex items-center gap-2 bg-[#CDB38B] text-white py-2 px-3 rounded-xl hover:bg-[#B8976D] transition" onClick={(e) => handleAdd(e, p)}>
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
