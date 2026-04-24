import axios from "axios";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import TopProducts from "@/components/dashboard/TopProducts";

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng sản phẩm"
          value={data.stats.totalProducts}
          change=""
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Đơn hàng"
          value={data.stats.totalOrders}
          change=""
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Khách hàng"
          value={data.stats.totalUsers}
          change=""
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Doanh thu"
          value={`${data.stats.totalRevenue.toLocaleString()} đ`}
          change=""
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={data.recentOrders} />
        <TopProducts products={data.topProducts} />
      </div>

    </div>
  );
};

export default Dashboard;