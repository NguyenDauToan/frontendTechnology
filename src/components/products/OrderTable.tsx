import { Eye, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho Order
export interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  status:
    | "Pending"
    | "Confirmed"
    | "Shipping"
    | "Delivered"
    | "Completed"
    | "Cancelled";
  createdAt: string;
}

interface OrderTableProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

const OrderTable = ({ orders, onViewDetail }: OrderTableProps) => {

  // Helper: Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper: Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔥 Dịch trạng thái sang tiếng Việt
  const translateStatus = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xác nhận";

      case "Confirmed":
        return "Đã xác nhận";

      case "Shipping":
        return "Đang giao";

      case "Delivered":
        return "Đã giao";

      case "Completed":
        return "Hoàn tất";

      case "Cancelled":
        return "Đã hủy";

      default:
        return status;
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-4 font-medium text-gray-700">Mã đơn</th>
            <th className="p-4 font-medium text-gray-700">Khách hàng</th>
            <th className="p-4 font-medium text-gray-700">Ngày đặt</th>
            <th className="p-4 font-medium text-gray-700">Tổng tiền</th>
            <th className="p-4 font-medium text-gray-700">Thanh toán</th>
            <th className="p-4 font-medium text-gray-700">Trạng thái</th>
            <th className="p-4 font-medium text-center text-gray-700">
              Chi tiết
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-6 text-center text-gray-500"
              >
                Chưa có đơn hàng nào
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition"
              >
                {/* Mã đơn */}
                <td className="p-4 font-mono text-xs text-gray-500">
                  #{order._id.slice(-6).toUpperCase()}
                </td>

                {/* Khách hàng */}
                <td className="p-4 font-medium">
                  {order.user?.name || "Khách vãng lai"}
                </td>

                {/* Ngày đặt */}
                <td className="p-4 text-gray-600">
                  {formatDate(order.createdAt)}
                </td>

                {/* Tổng tiền */}
                <td className="p-4 font-bold text-black">
                  {formatCurrency(order.totalPrice)}
                </td>

                {/* Thanh toán */}
                <td className="p-4">
                  {order.isPaid ? (
                    <span className="flex items-center text-green-600 gap-1 text-xs font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Đã thanh toán
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-600 gap-1 text-xs font-medium">
                      <Clock className="w-4 h-4" />
                      Chưa thanh toán
                    </span>
                  )}
                </td>

                {/* Trạng thái */}
                <td className="p-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border",

                      order.status === "Pending" &&
                        "bg-yellow-100 text-yellow-700 border-yellow-200",

                      order.status === "Confirmed" &&
                        "bg-blue-100 text-blue-700 border-blue-200",

                      order.status === "Shipping" &&
                        "bg-indigo-100 text-indigo-700 border-indigo-200",

                      order.status === "Delivered" &&
                        "bg-purple-100 text-purple-700 border-purple-200",

                      order.status === "Completed" &&
                        "bg-green-100 text-green-700 border-green-200",

                      order.status === "Cancelled" &&
                        "bg-red-100 text-red-700 border-red-200"
                    )}
                  >
                    {translateStatus(order.status)}
                  </span>
                </td>

                {/* Chi tiết */}
                <td className="p-4 text-center">
                  <button
                    onClick={() => onViewDetail(order)}
                    className="p-2 border rounded hover:bg-gray-100 transition"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;