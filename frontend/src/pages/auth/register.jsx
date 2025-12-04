import React, { useState } from "react";
import { motion } from "framer-motion";
import logo from "../../assets/hales_logo.jpg";
import Loading from "../../components/auth/loading";

import AccountService from "../../services/account.service";
import UserService from "../../services/user.service";
import AuthorizedService from "../../services/authorized.service";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "0", 
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isValidPhone = (p) => {
    const phoneClean = String(p).replace(/\s+/g, "");
    return /^0\d{9,10}$/.test(phoneClean);
  };

  const isValidEmail = (e) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!isValidPhone(form.phone)) {
      setMessage("Số điện thoại không hợp lệ. Bắt đầu bằng 0 và có 10-11 chữ số.");
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      setMessage("Email không hợp lệ.");
      setLoading(false);
      return;
    }

    if (form.password != form.confirmPassword) {
      setMessage("Mật khẩu không khớp!");
      setLoading(false);
      return;
    }

    try {
      const accounts = await (AccountService.list ? AccountService.list() : AccountService.all());
      const phoneExists = (accounts || []).some((acc) => {
        const accPhone = acc.USER_Phone ?? acc.ACCOUNT_Phone ?? acc.phone ?? acc.USERPhone ?? acc.USER_Phone;
        return String(accPhone) == String(form.phone);
      });

      if (phoneExists) {
        setMessage("Số điện thoại đã tồn tại. Vui lòng dùng SĐT khác hoặc dùng chức năng quên mật khẩu.");
        setLoading(false);
        return;
      }
      const userPayload = {
        USER_Phone: form.phone,
        USER_Email: form.email,
        USER_Name: form.name,
        USER_Gender: Number(form.gender), 
      };
      console.log("Creating user payload:", userPayload);
      const userRes = await UserService.create(userPayload);

      const accPayload = {
        ACCOUNT_Password: form.password,
        USER_Phone: form.phone,
      };
      const accRes = await AccountService.create(accPayload);

      const accountId =
        accRes?.ACCOUNT_Id ??
        accRes?.id ??
        accRes?.insertId ??
        (typeof accRes == "number" ? accRes : null);

      if (!accountId) throw new Error("Server không trả về ACCOUNT_Id");

      const authPayload = {
        ACCOUNT_Id: accountId,
        AUTHORIZATION_Id: 4,
      };

      await AuthorizedService.create(authPayload);

      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
        text: "Bạn đã đăng ký tài khoản. Vui lòng đăng nhập.",
        showConfirmButton: false,
        timer: 1400,
      });

      setLoading(false);
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error("Register error:", err);
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err?.message || "Có lỗi xảy ra, vui lòng thử lại sau",
      });

      setLoading(false);
      setMessage("Đăng ký thất bại, kiểm tra console để xem lỗi.");
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
          Đăng ký tài khoản
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full"
          initial="hidden"
          animate="visible"
        >
          {[
            { key: "name", label: "Họ và tên", type: "text" },
            { key: "phone", label: "Số điện thoại", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "gender", label: "Giới tính", type: "select" },
            { key: "password", label: "Mật khẩu", type: "password" },
            { key: "confirmPassword", label: "Xác nhận mật khẩu", type: "password" },
          ].map((field, i) => (
            <motion.div
              key={field.key}
              className="mb-4"
              variants={fadeInUp}
              custom={0.4 + i * 0.1}
            >
              <label className="block text-gray-600 text-sm font-medium mb-2">
                {field.label}
              </label>

              {field.type == "select" ? (
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
                >
                  <option value="0">Nam</option>
                  <option value="1">Nữ</option>
                </select>
              ) : (
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={`Nhập ${field.label.toLowerCase()}...`}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDB38B]"
                  required
                />
              )}
            </motion.div>
          ))}

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold rounded-lg text-white transition-all ${
              loading ? "bg-gray-400 cursor-wait" : "bg-[#CDB38B] hover:bg-[#bba177]"
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
