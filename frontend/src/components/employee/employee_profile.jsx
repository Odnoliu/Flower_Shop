import React, { useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { User, Phone, Mail, Save } from "lucide-react";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState({
    id: 1,
    name: "Nhân viên 1",
    phone: "0909123456",
    email: "nv1@example.com"
  });

  const save = () => {
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Hồ sơ đã được cập nhật",
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Cập nhật thông tin của bạn</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10"
        >
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
              {profile.name.charAt(0)}
            </div>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="relative">
              <User className="absolute left-4 top-4 w-6 h-6 text-violet-500" />
              <input
                className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all text-lg"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Họ và tên"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-4 w-6 h-6 text-emerald-500" />
              <input
                className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-lg"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="Số điện thoại"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 w-6 h-6 text-indigo-500" />
              <input
                className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-lg"
                value={profile.email}
                onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                placeholder="Email"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={save}
              className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              Lưu Thay Đổi
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}