import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axios_client";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit2 } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

export default function Profile() {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const {setActivePage } = useSidebar();
  useEffect(() => {
    setActivePage("Cá nhân");
  }, [setActivePage]);
  useEffect(() => {
    axiosClient.get("/user/1").then((res) => setUser(res.data));
  }, []);

  const handleSave = () => {
    // axiosClient.put("/user/1", user)
    setEditMode(false);
  };

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-8 text-[#3F3F3F] flex items-center gap-3">
        <User size={36} className="text-[#CDB38B]" />
        Hồ sơ cá nhân
      </h1>

      <div className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={user.avatar || "/src/assets/woman.png"}
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#CDB38B]"
          />
          <div>
            <h2 className="text-2xl font-bold text-[#3F3F3F]">{user.name}</h2>
            <p className="text-gray-600">{user.role == "admin" ? "Quản trị viên" : "Khách hàng"}</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { icon: Mail, label: "Email", key: "email" },
            { icon: Phone, label: "Số điện thoại", key: "phone" },
            { icon: MapPin, label: "Địa chỉ", key: "address" },
          ].map((field) => (
            <div key={field.key} className="flex items-center gap-4">
              <field.icon size={22} className="text-[#CDB38B]" />
              {editMode ? (
                <input
                  type="text"
                  value={user[field.key] || ""}
                  onChange={(e) =>
                    setUser({ ...user, [field.key]: e.target.value })
                  }
                  className="flex-1 border border-[#E8DAB5] rounded-xl px-4 py-2"
                />
              ) : (
                <p className="text-gray-700">{user[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-[#CDB38B] text-white py-2 px-6 rounded-xl hover:bg-[#B8976D] transition"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="border border-[#CDB38B] text-[#CDB38B] py-2 px-6 rounded-xl hover:bg-[#CDB38B] hover:text-white transition"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 border border-[#CDB38B] text-[#CDB38B] py-2 px-6 rounded-xl hover:bg-[#CDB38B] hover:text-white transition"
            >
              <Edit2 size={18} />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </motion.main>
  );
}