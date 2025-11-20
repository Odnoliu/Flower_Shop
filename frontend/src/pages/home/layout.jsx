import React from "react";
import Header from "../../components/section/header";
import Sidebar from "../../components/section/sidebar";
import Footer from "../../components/section/footer";
import { SidebarProvider, useSidebar } from "../../context/sidebar_context";
import { CartProvider } from "../../context/cart_context";
import Cart from "../../components/pages/cart";
import History from "../../components/pages/history";
import HomePageContent from "../../components/pages/homepage";
import Introduction from "../../components/pages/introduction";
import Orders from "../../components/pages/orders";
import ProductList from "../../components/pages/product_lists";
import Profile from "../../components/pages/profile";
import StoreOwnerDashboard from "../../components/store_owner/store_owner_dashboard";
import StoreOwnerProducts from "../../components/store_owner/store_owner_products_lists";
import StoreOwnerOrders from "../../components/store_owner/store_owner_orders";
import StoreOwnerAddProduct from "../../components/store_owner/store_owner_add_products";
import AdminUserManagement from "../../components/admin/admin_user_management";
import EmployeeOrders from "../../components/employee/employee_orders";
import EmployeeProfile from "../../components/employee/employee_profile";
function LayoutInner() {
  const { activePage, setActivePage, isOpen } = useSidebar();
  const left = isOpen ? 220 : 80;

  const renderPage = () => {
    const commonProps = { onNavigate: setActivePage };
    switch (activePage) {
      case "Trang chủ":
        return <HomePageContent {...commonProps} />;
      case "Sản phẩm":
        return <ProductList {...commonProps} />;
      case "Giới thiệu":
        return <Introduction {...commonProps} />;
      case "Giỏ hàng":
        return <Cart {...commonProps} />;
      case "Đơn hàng":
        return <Orders {...commonProps} />;
      case "Lịch sử":
        return <History {...commonProps} />;
      case "Cá nhân":
        return <Profile {...commonProps} />;
      case "StoreOwner:Trang chủ":
        return <StoreOwnerDashboard {...commonProps} />;
      case "StoreOwner:Sản phẩm":
        return <StoreOwnerProducts {...commonProps} />;
      case "StoreOwner:Thêm sản phẩm":
        return <StoreOwnerAddProduct {...commonProps} />; 
      case "StoreOwner:Quản lý đơn hàng":
        return <StoreOwnerOrders {...commonProps} />;
      case "Admin:Quản lý nhân sự":
        return <AdminUserManagement {...commonProps} />;
      case "Employee:Quản lý đơn hàng":
        return <EmployeeOrders {...commonProps} />;
      case "Employee:Cá nhân":
        return <EmployeeProfile {...commonProps} />;
      default:
        return <HomePageContent {...commonProps} />;
    }
  };

  return (
    <CartProvider>
      <div className="flex bg-[#FFF9F0] min-h-screen">
        <Sidebar onNavigate={setActivePage} />
        <div
          className="flex-1 flex flex-col min-h-screen transition-all"
          style={{ marginLeft: left }}
        >
          <Header />
          <main className="flex-1 p-6">{renderPage()}</main>
          <Footer />
        </div>
      </div>
    </CartProvider>
  );
}

export default function HomePage() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
