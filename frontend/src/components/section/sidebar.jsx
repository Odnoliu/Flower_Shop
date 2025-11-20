import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Info,
  ShoppingCart,
  ListOrdered,
  History,
  User,
  Menu,
  X,
  Box,
  BarChart2,
  FilePlus,
  Edit3,
  Trash2,
  Layers,
  DollarSign,
  Users,
  Settings,
  ClipboardList,
  Database
} from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";
import { useCart } from "../../context/cart_context";

export default function Sidebar({ onNavigate }) {
  const { isOpen, toggleSidebar, activePage, setActivePage } = useSidebar();
  const { totalCount } = useCart();
  const role = typeof window !== "undefined" ? localStorage.getItem("role") || "user" : "user";

  const baseMenu = [
    { icon: <Home size={18} />, label: "Trang chủ", routeLabel: "Trang chủ" },
    { icon: <Box size={18} />, label: "Sản phẩm", routeLabel: "Sản phẩm" },
    { icon: <Info size={18} />, label: "Giới thiệu", routeLabel: "Giới thiệu" },
  ];

  const userMenu = [
    { icon: <ShoppingCart size={18} />, label: "Giỏ hàng", routeLabel: "Giỏ hàng" },
    { icon: <ListOrdered size={18} />, label: "Đơn hàng", routeLabel: "Đơn hàng" },
    { icon: <History size={18} />, label: "Lịch sử", routeLabel: "Lịch sử" },
    { icon: <User size={18} />, label: "Cá nhân", routeLabel: "Cá nhân" },
  ];

  const storeOwnerMenu = [
    {
      icon: <BarChart2 size={18} />,
      label: "Báo cáo",
      routeLabel: "StoreOwner:Trang chủ",
      children: [
        { icon: <DollarSign size={14} />, label: "Thống kê doanh thu", routeLabel: "StoreOwner:Trang chủ" },
      ],
    },
    {
      icon: <Box size={18} />,
      label: "Quản lý sản phẩm",
      children: [
        { icon: <Layers size={14} />, label: "Danh sách sản phẩm", routeLabel: "StoreOwner:Sản phẩm" },
        { icon: <FilePlus size={14} />, label: "Thêm sản phẩm mới", routeLabel: "StoreOwner:Thêm sản phẩm" },
      ],
    },
    {
      icon: <ListOrdered size={18} />,
      label: "Quản lý đơn",
      children: [
        { icon: <Database size={14} />, label: "Danh sách đơn", routeLabel: "StoreOwner:Quản lý đơn hàng" },
      ],
    },
  ];
  const adminMenu = [
    {
      icon: <Users size={18} />,
      label: "Quản lý nhân sự",
      routeLabel: "Admin:Quản lý nhân sự",
      children: [
        { icon: <Users size={14} />, label: "Danh sách nhân sự", routeLabel: "Admin:Quản lý nhân sự" },
      ],
    },
  ];
  const employeeMenu = [
    { icon: <ListOrdered size={18} />, label: "Quản lý đơn (nhân viên)", routeLabel: "Employee:Quản lý đơn hàng" },
    { icon: <User size={18} />, label: "Hồ sơ nhân viên", routeLabel: "Employee:Cá nhân" },
  ];
  let menuItems = [];
  if (role == "store_owner") menuItems = storeOwnerMenu;
  else if (role == "admin") menuItems = adminMenu;
  else if (role == "employee") menuItems = employeeMenu;
  else menuItems = [...baseMenu, ...userMenu];

  const [openSubs, setOpenSubs] = useState({});
  const toggleSub = (idx) => setOpenSubs((s) => ({ ...s, [idx]: !s[idx] }));

  const handleClick = (label, routeLabel) => {
    const target = routeLabel || label;
    setActivePage(target);
    if (typeof onNavigate == "function") onNavigate(target);
  };

  return (
    <motion.aside
      animate={{ width: isOpen ? 220 : 80 }}
      transition={{ duration: 0.32, type: "spring" }}
      className="fixed left-0 top-0 h-screen bg-[#CDB38B] text-white shadow-xl flex flex-col justify-between z-50"
      role="navigation"
      aria-label="Sidebar"
    >
      <div className="flex flex-col items-center mt-6 space-y-6">
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded hover:bg-[#b99e6f]/30 transition"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <ul className="w-full px-2 space-y-2 text-[15px] font-medium">
          {menuItems.map((item, idx) => {
            const isParentWithChildren = Array.isArray(item.children);
            const isActive =
              activePage === item.routeLabel ||
              (isParentWithChildren &&
                item.children.some((c) => c.routeLabel === activePage));

            return (
              <li key={idx}>
                <div
                  onClick={() => {
                    if (isParentWithChildren) return toggleSub(idx);
                    handleClick(item.label, item.routeLabel);
                  }}
                  className={`flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 transition select-none
                      ${
                        isActive
                          ? "bg-[#FFE8C2] text-[#3F3F3F]"
                          : "hover:bg-[#FFF3DA] hover:text-[#3F3F3F]"
                      }`}
                >
                  <span
                    className={`${isActive ? "text-[#C07A00] scale-105" : ""}`}
                  >
                    {item.icon}
                  </span>
                  {isOpen && <span className="flex-1">{item.label}</span>}
                  {isParentWithChildren && isOpen && (
                    <span className="text-sm opacity-80">
                      {openSubs[idx] ? "▾" : "▸"}
                    </span>
                  )}
                </div>

                {isParentWithChildren && openSubs[idx] && isOpen && (
                  <ul className="pl-10 mt-2 space-y-1">
                    {item.children.map((c, ci) => {
                      const cActive = activePage === c.routeLabel;
                      return (
                        <li
                          key={ci}
                          onClick={() => handleClick(c.label, c.routeLabel)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-sm ${
                            cActive
                              ? "bg-[#FFDFAF] text-[#3F3F3F]"
                              : "hover:bg-[#FFF3DA]"
                          }`}
                        >
                          <span className="opacity-90">{c.icon}</span>
                          <span>{c.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mb-6 px-3">
        <div className="text-xs opacity-90 px-2 flex items-center justify-between">
          {isOpen ? (
            <>
              <div>
                <div className="mb-1">
                  Role: <strong>{role}</strong>
                </div>
                <div className="text-[12px] opacity-80">© Hales Flower</div>
              </div>
              {role !== "store_owner" && role !== "admin" && (
                <div className="inline-flex items-center justify-center text-xs bg-[#FF6B94] text-white px-2 py-1 rounded-full">
                  {totalCount || 0}
                </div>
              )}
            </>
          ) : (
            <div className="text-[12px]">© HF</div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
