import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/hales_logo.jpg";
import Loading from "../../components/auth/loading";
import axiosClient from "../../api/axios_client";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("isLoggedIn");
    if (storedUser) {
      Swal.fire({
        icon: "info",
        title: "Bạn đã đăng nhập!",
        text: "Đang chuyển hướng về trang chủ...",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => navigate("/"), 1500);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.get("/user");
      const users = response.data;
      const foundUser = users.find(
        (u) => u.phone === phone && u.password === password
      );

      if (foundUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", foundUser.id);
        Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công!",
          text: `Chào mừng ${foundUser.name}!`,
          showConfirmButton: false,
          timer: 3000,
        });

        // Chuyển hướng sau khi đăng nhập
        setTimeout(() => navigate("/"), 3000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Sai thông tin!",
          text: "Số điện thoại hoặc mật khẩu không chính xác!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối!",
        text: "Không thể kết nối đến máy chủ JSON Server!",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#CDB38B] to-[#f4e7cd]">
      {loading && <Loading />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-[90%] max-w-md flex flex-col items-center"
      >
        <motion.img
          src={logo}
          alt="Logo"
          className="w-24 mb-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
        />

        <motion.h1
          className="text-2xl font-semibold text-[#CDB38B] mb-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
        >
          Đăng nhập tài khoản
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-4" variants={fadeInUp} custom={0.4}>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
              required
            />
          </motion.div>

          <motion.div className="mb-6" variants={fadeInUp} custom={0.5}>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded-lg text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-wait"
                : "bg-[#CDB38B] hover:bg-[#bba177]"
            }`}
            variants={fadeInUp}
            custom={0.6}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
