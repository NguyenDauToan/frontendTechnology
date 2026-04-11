import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Hàm helper để lấy tiêu đề dựa trên URL hiện tại
  // Bạn có thể mở rộng danh sách này khớp với menuItems trong Sidebar
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin/products")) return "Quản lý sản phẩm";
    if (path.includes("/admin/categories")) return "Quản lý danh mục";
    if (path.includes("/admin/orders")) return "Quản lý đơn hàng";
    if (path.includes("/admin/customers")) return "Khách hàng";
    if (path.includes("/admin/analytics")) return "Thống kê";
    if (path.includes("/admin/settings")) return "Cài đặt";
    return "Tổng quan"; // Mặc định là Dashboard
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* 1. SIDEBAR (Fixed Left) */}
      {/* Sidebar component đã có class fixed bên trong nó, nên chỉ cần gọi ra */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />

      {/* 2. RIGHT CONTENT WRAPPER */}
      {/* Phần này sẽ trượt sang phải tùy thuộc vào độ rộng của Sidebar */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* A. HEADER */}
        {/* Header nằm trong wrapper này để nó luôn full chiều rộng còn lại */}
        <Header title={getPageTitle()} />

        {/* B. MAIN CONTENT (Outlet) */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="container mx-auto">
             <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;