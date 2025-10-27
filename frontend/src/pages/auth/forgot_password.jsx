import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/hales_logo.jpg";
import Loading from "../../components/auth/loading";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    setTimeout(() => {
      setMessage(`📱 Mã OTP đã được gửi đến số ${phone}`);
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
          Quên mật khẩu
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-6" variants={fadeInUp} custom={0.4}>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại tài khoản..."
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
            {loading ? "Đang gửi mã..." : "Gửi mã OTP"}
          </motion.button>
        </motion.form>

        {message && (
          <motion.p
            className="mt-6 text-center text-sm text-green-600 font-medium"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.7}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
