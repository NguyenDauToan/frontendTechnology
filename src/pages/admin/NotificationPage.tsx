import { useEffect, useState } from "react";
import { fetchLowStockProducts } from "@/api/productService";
import { Bell, Package, ShoppingCart, CheckCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Định nghĩa kiểu dữ liệu cho thông báo
interface NotificationItem {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
  link: string;
  isRead: boolean;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const notifs: NotificationItem[] = [];

        // 1. Lấy cảnh báo Kho (Sản phẩm sắp hết)
        const lowStockData = await fetchLowStockProducts();
        if (Array.isArray(lowStockData) && lowStockData.length > 0) {
           lowStockData.forEach((p: any) => {
             notifs.push({
               id: `stock-${p._id || p.id}`,
               type: "warning",
               title: "Cảnh báo tồn kho",
               message: `Sản phẩm "${p.name}" chỉ còn ${p.stock} cái. Cần nhập hàng ngay!`,
               time: "Hiện tại",
               link: "/admin/warehouse",
               isRead: false,
             });
           });
        }

        // 2. (Mockup) Giả lập thông báo đơn hàng mới - Bạn có thể thay bằng API thật sau này
        notifs.push({
            id: "order-mock-1",
            type: "info",
            title: "Đơn hàng mới",
            message: "Khách hàng Nguyễn Văn A vừa đặt đơn hàng #DH001 trị giá 5.000.000đ",
            time: "10 phút trước",
            link: "/admin/orders",
            isRead: true,
        });

        setNotifications(notifs);
      } catch (error) {
        console.error("Lỗi tải thông báo", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Hàm đánh dấu đã đọc (Giả lập)
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    toast.success("Đã đánh dấu đã đọc");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success("Đã đọc tất cả");
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
             <Bell className="w-6 h-6" /> Thông báo hệ thống
           </h1>
           <p className="text-gray-500 mt-1">Cập nhật các hoạt động quan trọng của cửa hàng</p>
        </div>
        <button 
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
        >
            <CheckCheck className="w-4 h-4" /> Đánh dấu tất cả đã đọc
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải thông báo...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Bạn không có thông báo nào mới.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div 
                key={item.id} 
                className={`flex gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    item.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
                }`}
            >
                {/* Icon loại thông báo */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                    {item.type === 'warning' ? <Package className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </div>

                {/* Nội dung */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-semibold ${item.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {item.title}
                        </h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.time}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                    
                    <div className="mt-3 flex gap-4 text-xs">
                        <Link to={item.link} className="text-blue-600 hover:underline font-medium">
                            Xem chi tiết
                        </Link>
                        {!item.isRead && (
                            <button onClick={() => markAsRead(item.id)} className="text-gray-500 hover:text-gray-900">
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;