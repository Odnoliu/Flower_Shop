import React, { createContext, useState, useContext, useMemo } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const role =
    typeof window != "undefined"
      ? localStorage.getItem("role") || "user"
      : "user";
  const defaultActive = useMemo(() => {
    switch (role) {
      case "store_owner":
        return "StoreOwner:Trang chủ";
      case "admin":
        return "Admin:Quản lý nhân sự";
      case "employee":
        return "Employee:Quản lý đơn hàng";
      default:
        return "Trang chủ";
    }
  }, [role]);

  const [activePage, setActivePage] = useState(defaultActive);
  const toggleSidebar = () => setIsOpen((s) => !s);

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, activePage, setActivePage }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
