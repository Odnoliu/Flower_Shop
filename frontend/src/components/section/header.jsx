import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import logo from "../../assets/hales_logo.jpg";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axios_client";
import AuthService from "../../services/auth.service";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartCount(cart.length);
  }, []);

  const loggedIn = localStorage.getItem("isLoggedIn") == "true";
  const phone = localStorage.getItem("phone") || "";
  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <motion.header
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-[#FFF9F0] shadow-sm p-4 flex justify-between items-center z-50 relative"
    >
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Hales Logo"
          className="w-10 h-10 rounded-full object-cover shadow-md"
        />
        <h1 className="text-2xl font-bold text-[#3F3F3F]">Hales Flower Shop</h1>
      </div>
      <div className="flex items-center space-x-6 text-[#CDB38B] font-semibold">
        {loggedIn ? (
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 select-none"
              role="button"
              tabIndex={0}
            >
              {phone ? (
                <p className="text-sm font-medium text-gray-800">{phone}</p>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  Tài khoản
                </span>
              )}

              <img
                src="data:image/png;base64,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"
                alt="User Avatar"
                className="w-9 h-9 rounded-full border-2 border-[#CDB38B] object-cover shadow-sm hover:shadow-md transition-shadow"
              />
            </div>
            <button
              onClick={handleLogout}
              className="text-sm cursor-pointer text-[#CDB38B] hover:text-[#a68b62] transition"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
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
