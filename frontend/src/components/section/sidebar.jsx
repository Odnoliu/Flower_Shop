import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Flower,
  Info,
  ShoppingCart,
  ListOrdered,
  History,
  User,
  Menu,
  X,
} from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

export default function Sidebar({ onNavigate, activePage }) {
  const { isOpen, toggleSidebar } = useSidebar();
  const isLoggedIn = localStorage.getItem("isLoggedIn") == "true";
  
  const baseMenu = [
    { icon: <Home size={22} />, label: "Trang chủ" },
    { icon: <Flower size={22} />, label: "Sản phẩm" },
    { icon: <Info size={22} />, label: "Giới thiệu" },
  ];

  const userMenu = [
    { icon: <ShoppingCart size={22} />, label: "Giỏ hàng" },
    { icon: <ListOrdered size={22} />, label: "Đơn hàng" },
    { icon: <History size={22} />, label: "Lịch sử" },
    { icon: <User size={22} />, label: "Cá nhân" },
  ];

  const menuItems = isLoggedIn ? [...baseMenu, ...userMenu] : baseMenu;

  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 80 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="fixed left-0 top-0 h-screen bg-[#CDB38B] text-white shadow-xl flex flex-col justify-between z-50"
    >
      <div className="flex flex-col items-center mt-6 space-y-10">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-[#3F3F3F] transition cursor-pointer"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-7 text-[16px] font-medium"
        >
          {menuItems.map((item, index) => {
            const isActive = activePage === item.label;
            return (
              <li
                key={index}
                onClick={() => onNavigate && onNavigate(item.label)}
                className={`flex items-center space-x-4 cursor-pointer transition-all duration-300 rounded-xl px-3 py-2
              ${
                isActive
                  ? "bg-[#FFE8C2] text-[#3F3F3F] shadow-md"
                  : "text-[#7A7A7A] hover:bg-[#FFF3DA] hover:text-[#3F3F3F]"
              }`}
              >
                <span
                  className={`transition-transform duration-300 ${
                    isActive ? "scale-110 text-[#C07A00]" : "text-inherit"
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen && <span>{item.label}</span>}
              </li>
            );
          })}
        </motion.ul>
      </div>
    </motion.aside>
  );
}
