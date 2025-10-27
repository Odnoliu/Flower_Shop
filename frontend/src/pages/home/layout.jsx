import React, { useState } from "react";
import Header from "../../components/section/header";
import Sidebar from "../../components/section/sidebar";
import Footer from "../../components/section/footer";
import { SidebarProvider } from "../../context/sidebar_context";

import Cart from "../../components/pages/cart";
import History from "../../components/pages/history";
import HomePageContent from "../../components/pages/homepage";
import Introduction from "../../components/pages/introduction";
import Orders from "../../components/pages/orders";
import ProductList from "../../components/pages/product_lists";
import Profile from "../../components/pages/profile";

export default function HomePage() {

  const [activePage, setActivePage] = useState("Trang chủ");

  const renderPage = () => {
    switch (activePage) {
      case "Trang chủ":
        return <HomePageContent />;
      case "Sản phẩm":
        return <ProductList />;
      case "Giới thiệu":
        return <Introduction />;
      case "Giỏ hàng":
        return <Cart />;
      case "Đơn hàng":
        return <Orders />;
      case "Lịch sử":
        return <History />;
      case "Cá nhân":
        return <Profile />;
      default:
        return <HomePageContent />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex bg-[#FFF9F0] min-h-screen">
        {/* 🧭 Sidebar */}
        <Sidebar onNavigate={setActivePage} />

        {/* Nội dung chính */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6">{renderPage()}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
