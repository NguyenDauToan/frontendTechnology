import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import OrderTrackingTimeline from "./OrderTrackingTimeline";
import { updateOrderStatus } from "@/api/orderService"; 
import { toast } from "sonner";

interface OrderDetailDialogProps {
  order: any;
  onUpdate?: () => void; 
}

const OrderDetailDialog = ({ order, onUpdate }: OrderDetailDialogProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  
  // ĐÃ SỬA BƯỚC 1: Dùng Local State để lưu giữ data của đơn hàng.
  // Nhờ đó ta có thể tự chủ cập nhật giao diện mà không cần chờ cha truyền data mới xuống
  const [localOrder, setLocalOrder] = useState<any>(order);

  // Đồng bộ localOrder với prop order mỗi khi mở modal đơn hàng khác nhau
  useEffect(() => {
      setLocalOrder(order);
  }, [order]);

  const isCancelled = localOrder.status === 'Cancelled';

  // HÀM XỬ LÝ KHÁCH HÀNG BẤM "ĐÃ NHẬN ĐƯỢC HÀNG"
  const handleConfirmReceived = async () => {
    if (!confirm("Xác nhận bạn đã nhận được hàng và sản phẩm không có vấn đề gì?")) return;
    
    setIsConfirming(true);
    try {
        await updateOrderStatus(localOrder._id, "Completed");
        toast.success("Cảm ơn bạn đã xác nhận nhận hàng!");
        
        // ĐÃ SỬA BƯỚC 2: Tự động đổi trạng thái hiển thị của Local Order sang Completed ngay lập tức
        setLocalOrder({
            ...localOrder,
            status: "Completed",
            isPaid: true // Gắn kèm isPaid = true để bảng hiển thị Xanh luôn (nếu backend chưa cập nhật kịp)
        });

        // BƯỚC 3: Kích hoạt hàm onUpdate để Component cha ngầm gọi lại API tải danh sách đơn hàng ngoài nền
        if (onUpdate) {
            onUpdate();
        }
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
        setIsConfirming(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
            Xem hành trình đơn hàng
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết đơn hàng <Badge variant="outline">#{localOrder._id.slice(-6).toUpperCase()}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Trạng thái đơn hàng</h4>
                {!isCancelled ? (
                    // Truyền localOrder thay vì order cũ vào Timeline
                    <OrderTrackingTimeline order={localOrder} />
                ) : (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center gap-2">
                        <XCircle /> Đơn hàng đã bị hủy
                    </div>
                )}

                {/* KHỐI XÁC NHẬN NHẬN HÀNG CHỈ HIỆN KHI STATUS = Delivered */}
                {localOrder.status === 'Delivered' && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-500">
                        <div className="text-sm text-orange-800">
                            <p className="font-bold text-base mb-1">Kiện hàng đã được giao đến bạn!</p>
                            <p>Vui lòng chỉ nhấn "Đã nhận được hàng" khi kiện hàng đã được giao thành công.</p>
                        </div>
                        <Button 
                            onClick={handleConfirmReceived} 
                            disabled={isConfirming}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold whitespace-nowrap shadow-md h-11 px-6"
                        >
                            {isConfirming ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <CheckCircle2 className="mr-2 w-5 h-5" />}
                            Đã nhận được hàng
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase text-gray-500">
                        <MapPin className="w-4 h-4" /> Địa chỉ nhận hàng
                    </h4>
                    <div className="space-y-1">
                        <p className="font-bold text-gray-900">{localOrder.shippingAddress.recipient_name}</p>
                        <p className="text-sm text-gray-600">{localOrder.shippingAddress.phone}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {localOrder.shippingAddress.address}, {localOrder.shippingAddress.city}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase text-gray-500">
                        <Truck className="w-4 h-4" /> Thanh toán & Vận chuyển
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phương thức:</span>
                            <span className="font-medium">{localOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Trạng thái:</span>
                            {localOrder.isPaid ? 
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Đã thanh toán</span> : 
                                <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">Chưa thanh toán</span>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Chi tiết sản phẩm</h4>
                <div className="space-y-4">
                    {localOrder.orderItems.map((item: any) => (
                        <div key={item._id} className="flex gap-4 items-start">
                            <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Số lượng: x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                    ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2 bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tổng tiền hàng</span>
                        <span>{localOrder.itemsPrice ? localOrder.itemsPrice.toLocaleString() : "---"}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phí vận chuyển</span>
                        <span>{localOrder.shippingPrice ? localOrder.shippingPrice.toLocaleString() : "---"}đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-gray-200 mt-2">
                        <span>Thành tiền</span>
                        <span>{localOrder.totalPrice.toLocaleString()}đ</span>
                    </div>
                </div>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;