import { useEffect, useState } from "react";
import OrderTable,{Order} from "@/components/products/OrderTable";
import OrderDetailModal from "./OrderDetailModal";
import { fetchOrders } from "@/api/orderService";

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Khi bấm nút con mắt (Xem chi tiết)
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-gray-500">Theo dõi trạng thái và xử lý đơn hàng</p>
        </div>
        {/* Có thể thêm bộ lọc ngày tháng ở đây */}
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải danh sách...</div>
      ) : (
        <OrderTable 
          orders={orders} 
          onViewDetail={handleViewDetail} 
        />
      )}

      {/* Modal chi tiết */}
      <OrderDetailModal 
        isOpen={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        onUpdate={loadData} // Load lại data sau khi thanh toán thành công
      />
    </div>
  );
};

export default OrderPage;