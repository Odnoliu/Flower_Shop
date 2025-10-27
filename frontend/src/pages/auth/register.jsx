import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/hales_logo.jpg";
import Loading from "../../components/auth/loading";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    setTimeout(() => {
      if (form.password !== form.confirmPassword) {
        setMessage("⚠️ Mật khẩu không khớp!");
      } else {
        setMessage("🎉 Đăng ký thành công!");
      }
      setLoading(false);
    }, 2500);
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
          Đăng ký tài khoản
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full"
          initial="hidden"
          animate="visible"
        >
          {["name", "phone", "password", "confirmPassword"].map((field, i) => (
            <motion.div
              key={field}
              className="mb-4"
              variants={fadeInUp}
              custom={0.4 + i * 0.1}
            >
              <label className="block text-gray-600 text-sm font-medium mb-2">
                {field === "name"
                  ? "Họ và tên"
                  : field === "phone"
                  ? "Số điện thoại"
                  : field === "password"
                  ? "Mật khẩu"
                  : "Xác nhận mật khẩu"}
              </label>
              <input
                type={field.includes("password") ? "password" : "text"}
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                placeholder={`Nhập ${
                  field === "confirmPassword"
                    ? "lại mật khẩu"
                    : field === "name"
                    ? "họ và tên"
                    : field === "phone"
                    ? "số điện thoại"
                    : "mật khẩu"
                }...`}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
                required
              />
            </motion.div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded-lg text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-wait"
                : "bg-[#CDB38B] hover:bg-[#bba177]"
            }`}
            variants={fadeInUp}
            custom={0.8}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </motion.button>
        </motion.form>

        {message && (
          <motion.p
            className={`mt-6 text-center text-sm font-medium ${
              message.includes("thành công") ? "text-green-600" : "text-red-500"
            }`}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.9}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
