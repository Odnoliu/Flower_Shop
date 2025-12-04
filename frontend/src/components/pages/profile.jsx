import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Edit2, User, Loader2 } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";

import UserService from "../../services/user.service";
import AccountService from "../../services/account.service";
import AuthorizedService from "../../services/authorized.service";
import AddressService from "../../services/address.service";
import WardService from "../../services/ward.service";
import CityService from "../../services/city.service";
import Swal from "sweetalert2";

export default function Profile() {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState(null);
  const [addressObj, setAddressObj] = useState(null);
  const [cities, setCities] = useState([]);
  const [wards, setWards] = useState([]);

  const { setActivePage } = useSidebar();

  useEffect(() => {
    setActivePage("Cá nhân");
  }, [setActivePage]);

  const detectPhoneFromStorage = () => {
    const keys = ["user", "currentUser", "account", "currentAccount", "auth", "profile", "phone", "USER_Phone"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        if (data?.USER_Phone) return String(data.USER_Phone);
        if (data?.phone) return String(data.phone);
      } catch (e) {
        if (/^0\d{9,10}$/.test(raw)) return raw;
      }
    }
    return localStorage.getItem("phone") || localStorage.getItem("USER_Phone");
  };

  const arrayFrom = (res) => {
    if (!res) return [];
    return Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : res.users ?? [];
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const phone = detectPhoneFromStorage();
      let fetchedUser = null;

      if (phone) {
        if (typeof UserService.getByPhone === "function") {
          try {
            const r = await UserService.getByPhone(phone);
            fetchedUser = Array.isArray(r) ? r[0] : r?.data ?? r;
          } catch (e) {}
        }
        if (!fetchedUser) {
          const list = arrayFrom(await UserService.list());
          fetchedUser = list.find(u => String(u.USER_Phone ?? u.phone) == phone);
        }

        try {
          const accounts = arrayFrom(await (AccountService.list ? AccountService.list() : AccountService.all()));
          const acc = accounts.find(a => String(a.USER_Phone ?? a.phone) == phone);
          if (acc?.ACCOUNT_Id) {
            const auth = await AuthorizedService.getByAccountId(acc.ACCOUNT_Id);
            setRoleName(auth?.AUTHORIZATION_Name ?? auth?.role ?? "Khách hàng");
          }
        } catch (e) {}

        try {
          const addrList = arrayFrom((await AddressService.list()).addresses);
          const addr = addrList.find(a => String(a.USER_Phone) == phone);

          const wardRes = await WardService.list();
          const cityRes = await CityService.listCities();
          const wardList = wardRes.wards ?? [];
          const cityList = cityRes ?? [];

          setWards(wardList);
          setCities(cityList);

          if (addr) {
            const ward = wardList.find(w => String(w.WARD_Id ?? w.id) == addr.WARD_Id);
            const city = cityList.find(c => String(c.CITY_Id ?? c.id) == (ward?.CITY_Id ?? ""));
            setAddressObj({
              ADDRESS_Id: addr.ADDRESS_Id ?? addr.id,
              ADDRESS_Address: addr.ADDRESS_Address ?? "",
              ADDRESS_Description: addr.ADDRESS_Description ?? "",
              WARD_Id: addr.WARD_Id ?? null,
              WARD_Name: ward?.WARD_Name ?? "",
              CITY_Id: ward?.CITY_Id ?? null,
              CITY_Name: city?.CITY_Name ?? "",
            });
          }
        } catch (e) {
          setAddressObj(null);
        }
      }

      if (fetchedUser) {
        setUser({
          name: fetchedUser.USER_Name ?? fetchedUser.name ?? "",
          email: fetchedUser.USER_Email ?? fetchedUser.email ?? "",
          phone: fetchedUser.USER_Phone ?? fetchedUser.phone ?? "",
          gender: fetchedUser.USER_Gender ?? 0,
          raw: fetchedUser,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        USER_Phone: user.phone,
        USER_Name: user.name,
        USER_Email: user.email,
        USER_Gender: Number(user.gender),
      };

      try {
        await UserService.update(user.phone, payload);
      } catch (e) {
        const id = user.raw?.USER_Id ?? user.raw?.id;
        if (id) await UserService.update(id, payload);
      }

      if (addressObj) {
        const addrPayload = {
          USER_Phone: user.phone,
          ADDRESS_Address: addressObj.ADDRESS_Address ?? "",
          ADDRESS_Description: addressObj.ADDRESS_Description ?? "",
          WARD_Id: addressObj.WARD_Id ?? null,
        };

        const existing = (await AddressService.list()).addresses?.find(a => String(a.USER_Phone) == user.phone);
        if (existing?.ADDRESS_Id) {
          await AddressService.update(existing.ADDRESS_Id, addrPayload);
        } else {
          await AddressService.create(addrPayload);
        }
      }

      Swal.fire({ icon: "success", title: "Cập nhật thành công!", timer: 1500, showConfirmButton: false });
      setEditMode(false);
      loadProfile();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Lỗi", text: "Cập nhật thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const onCityChange = (cityId) => {
    const cid = cityId ? Number(cityId) : null;
    setAddressObj(prev => ({
      ...prev,
      CITY_Id: cid,
      CITY_Name: cities.find(c => String(c.CITY_Id ?? c.id) == cid)?.CITY_Name ?? "",
      WARD_Id: null,
      WARD_Name: "",
    }));
  };

  const onWardChange = (wardId) => {
    const wid = wardId ? Number(wardId) : null;
    const ward = wards.find(w => String(w.WARD_Id ?? w.id) == wid);
    const city = cities.find(c => String(c.CITY_Id ?? c.id) == (ward?.CITY_Id ?? ""));
    setAddressObj(prev => ({
      ...prev,
      WARD_Id: wid,
      WARD_Name: ward?.WARD_Name ?? "",
      CITY_Id: ward?.CITY_Id ?? null,
      CITY_Name: city?.CITY_Name ?? "",
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-[#F0E9DF] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full max-w-2xl"
      >
        <motion.div
          layout
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8DAB5] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#CDB38B]/10 to-[#E8DAB5]/20 px-10 py-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-4">
              <User className="w-10 h-10 text-[#CDB38B]" />
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600 mt-2">{roleName || "Khách hàng"}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#CDB38B] animate-spin" />
            </div>
          ) : (
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <InfoRow icon={User} label="Họ và tên">
                  {editMode ? (
                    <input
                      value={user.name || ""}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E8DAB5] rounded-xl focus:outline-none focus:border-[#CDB38B]"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-800">{user.name || "Chưa đặt tên"}</span>
                  )}
                </InfoRow>

                <InfoRow icon={Mail} label="Email">
                  {editMode ? (
                    <input
                      value={user.email || ""}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E8DAB5] rounded-xl focus:outline-none focus:border-[#CDB38B]"
                    />
                  ) : (
                    <span className="text-gray-700">{user.email}</span>
                  )}
                </InfoRow>

                <InfoRow icon={Phone} label="Số điện thoại">
                  <span className="text-gray-700 font-medium">{user.phone}</span>
                </InfoRow>

                {editMode && (
                  <InfoRow icon={User} label="Giới tính">
                    <select
                      value={user.gender ?? 0}
                      onChange={(e) => setUser({ ...user, gender: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-[#E8DAB5] rounded-xl focus:outline-none focus:border-[#CDB38B]"
                    >
                      <option value={0}>Nam</option>
                      <option value={1}>Nữ</option>
                      <option value={2}>Khác</option>
                    </select>
                  </InfoRow>
                )}

                {!editMode && (
                  <InfoRow icon={User} label="Giới tính">
                    <span className="text-gray-700">
                      {user.gender == 1 ? "Nữ" : user.gender == 2 ? "Khác" : "Nam"}
                    </span>
                  </InfoRow>
                )}
              </div>

              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-3">
                  <MapPin className="w-7 h-7 text-[#CDB38B]" />
                  Địa chỉ nhận hàng
                </h3>

                {!editMode ? (
                  <p className="text-gray-700 leading-relaxed">
                    {addressObj
                      ? `${addressObj.ADDRESS_Address}, ${addressObj.WARD_Name}, ${addressObj.CITY_Name}`
                      : "Chưa có địa chỉ"}
                    {addressObj?.ADDRESS_Description && (
                      <span className="block text-sm text-gray-500 mt-1">
                        ({addressObj.ADDRESS_Description})
                      </span>
                    )}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <input
                      placeholder="Mô tả (nhà riêng, công ty...)"
                      value={addressObj?.ADDRESS_Description ?? ""}
                      onChange={(e) => setAddressObj(prev => ({ ...prev, ADDRESS_Description: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#E8DAB5] rounded-xl"
                    />
                    <input
                      placeholder="Số nhà, tên đường"
                      value={addressObj?.ADDRESS_Address ?? ""}
                      onChange={(e) => setAddressObj(prev => ({ ...prev, ADDRESS_Address: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#E8DAB5] rounded-xl"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={addressObj?.CITY_Id ?? ""}
                        onChange={(e) => onCityChange(e.target.value)}
                        className="px-4 py-3 border border-[#E8DAB5] rounded-xl"
                      >
                        <option value="">-- Tỉnh / Thành phố --</option>
                        {cities.map(c => (
                          <option key={c.CITY_Id ?? c.id} value={c.CITY_Id ?? c.id}>
                            {c.CITY_Name ?? c.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={addressObj?.WARD_Id ?? ""}
                        onChange={(e) => onWardChange(e.target.value)}
                        className="px-4 py-3 border border-[#E8DAB5] rounded-xl"
                      >
                        <option value="">-- Quận / Huyện / Phường --</option>
                        {wards
                          .filter(w => String(w.CITY_Id ?? w.CITYId) == String(addressObj?.CITY_Id))
                          .map(w => (
                            <option key={w.WARD_Id ?? w.id} value={w.WARD_Id ?? w.id}>
                              {w.WARD_Name ?? w.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-10">
                {editMode ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={loading}
                      className="px-8 py-3 bg-[#CDB38B] text-white font-medium rounded-xl hover:bg-[#B8976D] transition shadow-lg"
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(false)}
                      className="px-8 py-3 border border-[#CDB38B] text-[#CDB38B] font-medium rounded-xl hover:bg-[#CDB38B] hover:text-white transition"
                    >
                      Hủy
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-3 px-8 py-3 border border-[#CDB38B] text-[#CDB38B] font-medium rounded-xl hover:bg-[#CDB38B] hover:text-white transition"
                  >
                    <Edit2 className="w-5 h-5" />
                    Chỉnh sửa thông tin
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Component nhỏ để tái sử dụng
const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-5">
    <Icon className="w-6 h-6 text-[#CDB38B] flex-shrink-0" />
    <div className="flex-1">
      <span className="text-gray-600 font-medium">{label}:</span>
      <div className="mt-1">{children}</div>
    </div>
  </div>
);