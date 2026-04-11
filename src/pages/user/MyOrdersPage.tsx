import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "@/api/orderService";
import Header from "@/components/layout/user/Header";
import { Loader2, Package, ShoppingBag, Clock, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PromoBanner from "./PromoBanner";
import OrderDetailDialog from "./OrderDetailDialog";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm load dữ liệu tách riêng để dùng lại cho nút Refresh
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Lỗi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper function: Format trạng thái với màu sắc chuẩn
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">Chờ xác nhận</Badge>;
      case 'Confirmed':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Đã xác nhận</Badge>;
      case 'Shipping':
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 animate-pulse">Đang giao hàng</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Giao thành công</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromoBanner/>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm border">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                    <p className="text-gray-500 text-sm">Theo dõi lịch sử mua sắm</p>
                </div>
            </div>
            {/* Nút Refresh để cập nhật trạng thái mới nhất từ Shipper */}
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="gap-2">
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Cập nhật
            </Button>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
        ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Bạn chưa có đơn hàng nào</h3>
                <p className="text-gray-500 mb-6">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
                <Button onClick={() => navigate("/")}>Bắt đầu mua sắm</Button>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        
                        {/* Header của Card đơn hàng */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="font-mono font-bold text-gray-900 text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                        </div>

                        {/* Nội dung đơn hàng */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Cột 1: Danh sách sản phẩm rút gọn */}
                                <div className="md:col-span-2 space-y-4">
                                    {order.orderItems.slice(0, 2).map((item: any) => (
                                        <div key={item._id} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-white">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                                            </div>
                                            <span className="font-semibold text-gray-900">
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </span>
                                        </div>
                                    ))}
                                    {order.orderItems.length > 2 && (
                                        <p className="text-sm text-gray-500 pl-2 italic">
                                            ... và {order.orderItems.length - 2} sản phẩm khác
                                        </p>
                                    )}
                                </div>

                                {/* Cột 2: Tổng tiền & Hành động */}
                                <div className="flex flex-col justify-between border-l border-gray-100 md:pl-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Tổng tiền thanh toán</p>
                                        <p className="text-xl font-bold text-red-600">
                                            {order.totalPrice.toLocaleString()}đ
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{order.paymentMethod}</p>
                                    </div>
                                    
                                    {/* Sử dụng Component Modal mới tạo */}
                                    <OrderDetailDialog order={order} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default MyOrdersPage;