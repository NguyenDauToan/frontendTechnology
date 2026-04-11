import { Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho Order
export interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Delivered' |'Completed' | 'Cancelled';
  createdAt: string;
}

interface OrderTableProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

const OrderTable = ({ orders, onViewDetail }: OrderTableProps) => {
  
  // Helper: Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper: Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-4 font-medium text-gray-700">Mã đơn</th>
            <th className="p-4 font-medium text-gray-700">Khách hàng</th>
            <th className="p-4 font-medium text-gray-700">Ngày đặt</th>
            <th className="p-4 font-medium text-gray-700">Tổng tiền</th>
            <th className="p-4 font-medium text-gray-700">Thanh toán</th>
            <th className="p-4 font-medium text-gray-700">Trạng thái</th>
            <th className="p-4 font-medium text-center text-gray-700">Chi tiết</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.length === 0 ? (
            <tr><td colSpan={7} className="p-6 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>
          ) : (
            orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="p-4 font-medium">{order.user?.name || "Khách vãng lai"}</td>
                <td className="p-4 text-gray-600">{formatDate(order.createdAt)}</td>
                <td className="p-4 font-bold text-black">{formatCurrency(order.totalPrice)}</td>
                
                {/* Trạng thái thanh toán */}
                <td className="p-4">
                  {order.isPaid ? (
                    <span className="flex items-center text-green-600 gap-1 text-xs font-medium">
                      <CheckCircle className="w-4 h-4" /> Đã trả
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-600 gap-1 text-xs font-medium">
                      <Clock className="w-4 h-4" /> Chưa trả
                    </span>
                  )}
                </td>

                {/* Trạng thái đơn hàng */}
                <td className="p-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    order.status === 'Completed' && "bg-green-100 text-green-700 border-green-200",
                    order.status === 'Pending' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                    order.status === 'Cancelled' && "bg-red-100 text-red-700 border-red-200",
                    order.status === 'Shipping' && "bg-blue-100 text-blue-700 border-blue-200",
                  )}>
                    {order.status}
                  </span>
                </td>

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