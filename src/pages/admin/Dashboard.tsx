import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import TopProducts from "@/components/dashboard/TopProducts";
import { useState, useEffect } from "react";
const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng sản phẩm"
          value="1,234"
          change="+12% so với tháng trước"
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Đơn hàng"
          value="567"
          change="+8% so với tháng trước"
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Khách hàng"
          value="2,890"
          change="+23% so với tháng trước"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Doanh thu"
          value="125.5M"
          change="-5% so với tháng trước"
          changeType="negative"
          icon={TrendingUp}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
};

export default Dashboard;
