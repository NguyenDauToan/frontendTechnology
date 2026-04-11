import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
}

const orders: Order[] = [
  { id: "DH001", customer: "Nguyễn Văn A", total: 2500000, status: "completed", date: "14/01/2026" },
  { id: "DH002", customer: "Trần Thị B", total: 1800000, status: "processing", date: "14/01/2026" },
  { id: "DH003", customer: "Lê Văn C", total: 3200000, status: "pending", date: "13/01/2026" },
  { id: "DH004", customer: "Phạm Thị D", total: 950000, status: "completed", date: "13/01/2026" },
  { id: "DH005", customer: "Hoàng Văn E", total: 4100000, status: "cancelled", date: "12/01/2026" },
];

const statusLabels = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const RecentOrders = () => {
  return (
    <div className="card-sharp p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Đơn hàng gần đây</h3>
        <button className="text-sm font-medium text-accent hover:underline">
          Xem tất cả →
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div 
            key={order.id}
            className="flex items-center justify-between p-4 border-2 border-border hover:border-accent transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-bold text-accent">
                #{order.id}
              </span>
              <div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-muted-foreground">{order.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                {order.total.toLocaleString("vi-VN")}đ
              </span>
              <span
                className={cn(
                  "badge-status text-xs",
                  order.status === "completed" && "badge-success",
                  order.status === "processing" && "bg-info text-white border-info",
                  order.status === "pending" && "badge-warning",
                  order.status === "cancelled" && "badge-destructive"
                )}
              >
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
