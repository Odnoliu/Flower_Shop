import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import logo from "../../assets/hales_logo.jpg";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/sidebar_context";
import axiosClient from "../../api/axios_client";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const { isOpen } = useSidebar();

  // Lấy thông tin giỏ hàng
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartCount(cart.length);
  }, []);

  // Kiểm tra đăng nhập và tải thông tin người dùng
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userId = localStorage.getItem("userId");
    console.log(loggedIn)
    setIsLoggedIn(loggedIn);

    if (loggedIn && userId) {
      axiosClient
        .get(`/user/${userId}`)
        .then((response) => setUserData(response.data))
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <motion.header
      animate={{
        marginLeft: isOpen ? 220 : 80,
        width: isOpen ? "calc(100% - 220px)" : "calc(100% - 80px)",
      }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-[#FFF9F0] shadow-sm p-4 flex justify-between items-center z-50 relative"
    >
      {/* Logo và tên thương hiệu */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Hales Logo"
          className="w-10 h-10 rounded-full object-cover shadow-md"
        />
        <h1 className="text-2xl font-bold text-[#3F3F3F]">
          Hales Flower Shop
        </h1>
      </div>

      {/* Phần bên phải */}
      <div className="flex items-center space-x-6 text-[#CDB38B] font-semibold">
        {/* Giỏ hàng */}
        <div className="relative cursor-pointer hover:text-[#a68b62] transition">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </div>

        {/* Nếu đăng nhập rồi thì hiện avatar */}
        {isLoggedIn && userData ? (
          <div className="flex items-center space-x-3">
            <Link to="/profile">
              <img
                src={userData.avatar || "/default_avatar.png"}
                alt="User Avatar"
                className="w-9 h-9 rounded-full border-2 border-[#CDB38B] object-cover cursor-pointer hover:scale-105 transition-transform"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-[#CDB38B] hover:text-[#a68b62] transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          // Nếu chưa đăng nhập
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="cursor-pointer hover:text-[#a68b62] transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="cursor-pointer hover:text-[#a68b62] transition"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </motion.header>
  );
}
