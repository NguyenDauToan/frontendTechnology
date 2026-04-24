import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Props {
  orders: any[];
}

const statusLabels: any = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const RecentOrders = ({ orders }: Props) => {
  const navigate = useNavigate ();
  if (!orders || orders.length === 0)
    return <div className="p-6">Không có đơn hàng</div>;

  return (
    <div className="card-sharp p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Đơn hàng gần đây</h3>
        <button
          onClick={() => navigate("/admin/orders")}
          className="text-sm font-medium text-accent hover:underline"
        >
          Xem tất cả →
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order: any, index: number) => {
          const status = order.status || "Pending";

          return (
            <div
              key={order._id}
              className="flex items-center justify-between p-4 border-2 border-border hover:border-accent transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-accent">
                  #{order._id.slice(-6)}
                </span>

                <div>
                  <p className="font-medium">
                    {order.user?.name || "Khách"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {order.totalPrice?.toLocaleString("vi-VN")}đ
                </span>

                <span
                  className={cn(
                    "badge-status text-xs",
                    status === "Completed" && "badge-success",
                    status === "Shipping" && "bg-blue-500 text-white",
                    status === "Pending" && "badge-warning",
                    status === "Cancelled" && "badge-destructive",
                    status === "Confirmed" && "bg-purple-500 text-white",
                    status === "Delivered" && "bg-green-500 text-white"
                  )}
                >
                  {statusLabels[status]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentOrders;