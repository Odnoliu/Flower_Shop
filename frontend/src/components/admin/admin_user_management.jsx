// src/components/admin/admin_user_management.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { UserPlus, Edit, Trash2, Crown, Shield, UserCheck, Users, Loader2, User } from "lucide-react";

import AccountService from "../../services/account.service";
import UserService from "../../services/user.service";
import AuthorizedService from "../../services/authorized.service";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    role: "employee", 
    password: "", 
    gender: "0"  
  });
  const [loading, setLoading] = useState(false);

  const ROLE_ID_MAP = {
    admin: 1,
    store_owner: 2,
    employee: 3,
  };

  const roleConfig = {
    store_owner: { color: "from-rose-500 to-pink-600", icon: Crown, label: "Chủ cửa hàng" },
    admin: { color: "from-purple-500 to-violet-600", icon: Shield, label: "Quản trị viên" },
    employee: { color: "from-emerald-500 to-teal-600", icon: UserCheck, label: "Nhân viên" },
    user: { color: "from-gray-400 to-gray-600", icon: Users, label: "Người dùng" },
  };

  const arrayFrom = (res) => {
    if (!res) return [];
    return Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : res.users ?? [];
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const rawUsers = arrayFrom(await UserService.list());
      const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));

      const accByPhone = {};
      accounts.forEach((a) => {
        const phone = a.USER_Phone ?? a.ACCOUNT_Phone ?? a.phone;
        if (phone) accByPhone[String(phone)] = a;
      });

      const uiUsers = (rawUsers || []).map((u, idx) => {
        const phone = u.USER_Phone ?? u.phone ?? u.USERPhone;
        const acc = accByPhone[String(phone)];
        const gender = u.USER_Gender ?? 0;
        return {
          phone: phone ?? `unknown-${idx}`,
          name: u.USER_Name ?? u.name ?? "Không tên",
          email: u.USER_Email ?? u.email ?? "",
          role: "user",
          gender: gender,
          rawUser: u,
          account: acc ?? null,
        };
      });

      for (let i = 0; i < uiUsers.length; i++) {
        const acc = uiUsers[i].account;
        if (!acc) continue;
        const accountId = acc.ACCOUNT_Id ?? acc.id ?? acc.ACCOUNTId ?? null;
        if (!accountId) continue;
        try {
          const auth = await AuthorizedService.getByAccountId(accountId);
          const r = (auth?.role || "").toLowerCase();
          const roleKey = r.includes("admin")
            ? "admin"
            : r.includes("owner") || r.includes("store")
            ? "store_owner"
            : r.includes("employee")
            ? "employee"
            : "user";
          uiUsers[i].role = roleKey;
        } catch (e) {}
      }

      setUsers(uiUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const reset = () => {
    setForm({ name: "", phone: "", email: "", role: "employee", password: "", gender: "0" });
    setEditing(null);
  };

  const validatePhone = (p) => /^0\d{9,10}$/.test(String(p).replace(/\s+/g, ""));
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  const addUser = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      return Swal.fire({ icon: "error", title: "Thiếu thông tin", text: "Vui lòng nhập đầy đủ tên, số điện thoại và email!", timer: 2000 });
    }
    if (!validatePhone(form.phone)) {
      return Swal.fire({ icon: "error", title: "Số điện thoại không hợp lệ", text: "Vui lòng nhập SĐT bắt đầu bằng 0 và 10-11 chữ số" });
    }
    if (!validateEmail(form.email)) {
      return Swal.fire({ icon: "error", title: "Email không hợp lệ", text: "Vui lòng nhập email hợp lệ" });
    }

    setLoading(true);
    try {
      const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));
      const exists = accounts.some((a) => {
        const phone = a.USER_Phone ?? a.ACCOUNT_Phone ?? a.phone;
        return String(phone) == String(form.phone);
      });
      if (exists) {
        setLoading(false);
        return Swal.fire({ icon: "error", title: "Số điện thoại đã tồn tại", text: "Vui lòng sử dụng số khác hoặc yêu cầu reset mật khẩu" });
      }

      const userPayload = { 
        USER_Phone: form.phone, 
        USER_Email: form.email, 
        USER_Name: form.name, 
        USER_Gender: Number(form.gender) 
      };
      await UserService.create(userPayload);

      const accPayload = { ACCOUNT_Password: form.password || "changeme123", USER_Phone: form.phone };
      const accRes = await AccountService.create(accPayload);
      const accountId = accRes?.ACCOUNT_Id ?? accRes?.id ?? accRes?.insertId ?? null;

      const authPayload = { ACCOUNT_Id: accountId, AUTHORIZATION_Id: ROLE_ID_MAP[form.role] ?? ROLE_ID_MAP.employee };
      await AuthorizedService.create(authPayload);

      Swal.fire({ icon: "success", title: "Đã thêm nhân sự", showConfirmButton: false, timer: 1300 });
      reset();
      fetchUsers();
    } catch (err) {
      console.error("Add user error:", err);
      Swal.fire({ icon: "error", title: "Thêm thất bại", text: err?.message || "Có lỗi xảy ra" });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u) => {
    setEditing(u);
    setForm({ 
      name: u.name, 
      phone: u.phone, 
      email: u.email ?? "", 
      role: u.role, 
      password: "", 
      gender: String(u.gender ?? 0)
    });
  };

  const saveEdit = async () => {
    if (!form.name.trim()) {
      return Swal.fire("Lỗi", "Vui lòng nhập tên", "error");
    }
    if (form.email.trim() && !validateEmail(form.email)) {
      return Swal.fire({ icon: "error", title: "Email không hợp lệ", text: "Vui lòng nhập email hợp lệ" });
    }
    setLoading(true);
    try {
      try {
        await UserService.update(editing.phone, {
          USER_Phone: editing.phone,
          USER_Email: form.email,
          USER_Name: form.name,
          USER_Gender: Number(form.gender),
        });
      } catch (e) {
        const rawId = editing?.rawUser?.USER_Id ?? editing?.rawUser?.id ?? null;
        if (rawId) {
          await UserService.update(rawId, {
            USER_Phone: editing.phone,
            USER_Email: form.email,
            USER_Name: form.name,
            USER_Gender: Number(form.gender),
          });
        }
      }

      if (form.password && form.password.trim()) {
        const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));
        const acc = accounts.find(a => String(a.USER_Phone ?? a.phone) == editing.phone);
        if (acc) {
          const accountId = acc.ACCOUNT_Id ?? acc.id;
          if (accountId) {
            await AccountService.update(accountId, { ACCOUNT_Password: form.password });
          }
        }
      }

      const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));
      const acc = accounts.find(a => String(a.USER_Phone ?? a.phone) == editing.phone);
      const accountId = acc?.ACCOUNT_Id ?? acc?.id ?? null;
      if (accountId) {
        try { await AuthorizedService.remove(accountId); } catch(e) {}
        await AuthorizedService.create({ 
          ACCOUNT_Id: accountId, 
          AUTHORIZATION_Id: ROLE_ID_MAP[form.role] ?? ROLE_ID_MAP.employee 
        });
      }

      setUsers(prev => prev.map(u => 
        u.phone == editing.phone 
          ? { ...u, name: form.name, email: form.email, role: form.role, gender: Number(form.gender) } 
          : u
      ));

      Swal.fire({ icon: "success", title: "Đã cập nhật!", timer: 1200, showConfirmButton: false });
      reset();
    } catch (err) {
      console.error("Save edit error:", err);
      Swal.fire("Lỗi", "Cập nhật thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (phone) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Xác nhận xóa?",
      text: `Xóa tài khoản có SĐT ${phone}? Hành động này không thể hoàn tác!`,
      showCancelButton: true,
      confirmButtonText: "Xóa luôn",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));
      const acc = accounts.find(a => String(a.USER_Phone ?? a.phone) == phone);
      const accountId = acc?.ACCOUNT_Id ?? acc?.id ?? null;

      if (accountId) {
        try { await AuthorizedService.remove(accountId); } catch (e) {}
        try { await AccountService.remove(accountId); } catch (e) {}
      }

      await UserService.remove(phone);

      setUsers(prev => prev.filter(u => u.phone != phone));
      Swal.fire({ icon: "success", title: "Đã xóa!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Xóa thất bại", text: err?.message || "" });
    } finally {
      setLoading(false);
    }
  };

  const getGenderLabel = (gender) => {
    return gender == 1 ? "Nữ" : gender == 2 ? "Khác" : "Nam";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-[#F0E9DF] p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Quản Lý Nhân Sự</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-gray-200 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <UserPlus className="w-9 h-9 text-emerald-600" />
              {editing ? `Chỉnh sửa ${editing.phone}` : "Thêm nhân sự mới"}
            </h3>

            <div className="space-y-5">
              <input
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                placeholder="Họ và tên"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              {!editing && (
                <input
                  className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              )}
              <input
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              />

              <div className="flex items-center gap-3">
                <select
                  className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                  value={form.gender}
                  onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="0">Nam</option>
                  <option value="1">Nữ</option>
                </select>
              </div>

              <select
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="admin">Quản trị viên</option>
                <option value="store_owner">Chủ cửa hàng</option>
                <option value="employee">Nhân viên</option>
              </select>

              <input
                type="password"
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/30 transition-all text-lg"
                placeholder="Mật khẩu (để trống sẽ dùng default)"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              />

              <div className="flex gap-4 pt-4">
                {editing ? (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={saveEdit} className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/50 transition-all cursor-pointer">
                      Cập nhật
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset} className="px-8 py-4 bg-gray-200 border border-gray-300 text-gray-900 font-bold rounded-2xl hover:bg-gray-300 transition-all cursor-pointer">
                      Hủy
                    </motion.button>
                  </>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addUser} className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-3 cursor-pointer">
                    <UserPlus className="w-7 h-7" />
                    Thêm nhân sự
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-5 overflow-y-auto max-h-[70vh]">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              Danh sách nhân sự ({users.length})
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              </div>
            ) : (
              <AnimatePresence>
                {users.map((user) => {
                  const roleCfg = roleConfig[user.role] || roleConfig.user;
                  const RoleIcon = roleCfg.icon;
                  return (
                    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={user.phone} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 hover:bg-gray-100 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${roleCfg.color} flex items-center justify-center shadow-xl`}>
                            <RoleIcon className="w-9 h-9 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">{user.name}</p>
                            <p className="text-gray-600 text-lg">{user.phone}</p>
                            {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
                            <p className="text-sm text-emerald-600 font-medium mt-1">{getGenderLabel(user.gender)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4 min-w-[120px]">
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">{roleCfg.label}</p>
                          </div>

                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => startEdit(user)} className="p-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-600 rounded-xl border border-yellow-500/50 cursor-pointer">
                              <Edit className="w-5 h-5" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => remove(user.phone)} className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-600 rounded-xl border border-red-500/50 cursor-pointer">
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}