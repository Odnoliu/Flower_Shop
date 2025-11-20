// src/components/admin/admin_user_management.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { UserPlus, Edit, Trash2, Crown, Shield, UserCheck, Users } from "lucide-react";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", role: "employee" });

  useEffect(() => {
    setUsers([
      { id: 1, name: "Nguyễn Văn A", phone: "0909123456", role: "store_owner" },
      { id: 2, name: "Trần Thị B", phone: "0912345678", role: "admin" },
      { id: 3, name: "Lê Văn C", phone: "0987654321", role: "employee" },
    ]);
  }, []);

  const reset = () => {
    setForm({ name: "", phone: "", role: "employee" });
    setEditing(null);
  };

  const addUser = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập đầy đủ tên và số điện thoại!",
        timer: 2000,
      });
    }
    const id = Date.now();
    setUsers((prev) => [...prev, { id, ...form }]);
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Đã thêm nhân sự mới",
      timer: 1800,
      showConfirmButton: false,
    });
    reset();
  };

  const startEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, phone: user.phone, role: user.role });
  };

  const saveEdit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      return Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin", "error");
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === editing.id ? { ...u, ...form } : u))
    );
    Swal.fire({
      icon: "success",
      title: "Đã cập nhật!",
      timer: 1500,
      showConfirmButton: false,
    });
    reset();
  };

  const remove = (id) => {
    Swal.fire({
      icon: "warning",
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      showCancelButton: true,
      confirmButtonText: "Xóa luôn",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const roleConfig = {
    store_owner: { color: "from-rose-500 to-pink-600", icon: Crown, label: "Chủ cửa hàng" },
    admin: { color: "from-purple-500 to-violet-600", icon: Shield, label: "Quản trị viên" },
    employee: { color: "from-emerald-500 to-teal-600", icon: UserCheck, label: "Nhân viên" },
    user: { color: "from-gray-400 to-gray-600", icon: Users, label: "Người dùng" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Quản Lý Nhân Sự
          </h1>
          <p className="text-purple-200 text-lg">Toàn quyền thêm, sửa, xóa tài khoản hệ thống</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Thêm / Sửa */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <UserPlus className="w-9 h-9 text-emerald-400" />
              {editing ? `Chỉnh sửa #${editing.id}` : "Thêm nhân sự mới"}
            </h3>

            <div className="space-y-5">
              <input
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all text-lg"
                placeholder="Họ và tên"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all text-lg"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <select
                className="w-full px-5 py-4 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all text-lg"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="store_owner">Chủ cửa hàng</option>
                <option value="admin">Quản trị viên</option>
                <option value="employee">Nhân viên</option>
                <option value="user">Người dùng thường</option>
              </select>

              <div className="flex gap-4 pt-4">
                {editing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveEdit}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/50 transition-all"
                    >
                      Cập nhật
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={reset}
                      className="px-8 py-4 bg-white/20 border border-white/40 text-white font-bold rounded-2xl hover:bg-white/30 transition-all"
                    >
                      Hủy
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addUser}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3"
                  >
                    <UserPlus className="w-7 h-7" />
                    Thêm nhân sự
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Danh sách nhân sự */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              Danh sách nhân sự ({users.length})
            </h3>

            <AnimatePresence>
              {users.map((user) => {
                const { icon: RoleIcon, color, label } = roleConfig[user.role];
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={user.id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-xl`}>
                          <RoleIcon className="w-9 h-9 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{user.name}</p>
                          <p className="text-purple-200 text-lg">{user.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                            {label}
                          </p>
                        </div>

                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(user)}
                            className="p-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-xl backdrop-blur-sm border border-yellow-500/50"
                          >
                            <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => remove(user.id)}
                            className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl backdrop-blur-sm border border-red-500/50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}