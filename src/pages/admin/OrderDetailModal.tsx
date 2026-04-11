import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markOrderAsPaid, updateOrderStatus } from "@/api/orderService"; 
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, Package, Truck, CheckCircle2, Clock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: () => void;
}

const OrderDetailModal = ({ isOpen, onClose, order, onUpdate }: Props) => {
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  if (!order) return null;

  const orderId = order._id || order.id;

  const handleConfirmPayment = async () => {
    if(!confirm("Xác nhận đã thu tiền cho đơn hàng này?")) return;

    setLoadingPay(true);
    try {
      await markOrderAsPaid(orderId);
      toast.success("Đã xác nhận thanh toán thành công!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xử lý thanh toán");
    } finally {
      setLoadingPay(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: string, message: string) => {
    if(!confirm(`Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái: ${message}?`)) return;

    setLoadingStatus(true);
    try {
      await updateOrderStatus(orderId, nextStatus); 
      toast.success(`Đã cập nhật trạng thái: ${message}`);
      onUpdate();
      
      if (nextStatus === "Completed") {
          onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setLoadingStatus(false);
    }
  };

  const renderNextStepAction = () => {
    if (order.status === "Cancelled") {
        return <div className="text-red-500 font-medium text-center p-2 bg-red-50 rounded">Đơn hàng đã bị hủy</div>;
    }

    switch (order.status) {
      case "Pending":
        return (
          <Button 
            onClick={() => handleUpdateStatus("Confirmed", "Xác nhận & Đóng gói")} 
            disabled={loadingStatus}
            className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            {loadingStatus ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Package className="mr-2 w-4 h-4" />}
            BƯỚC 1: Xác nhận & Đóng gói
          </Button>
        );
      case "Confirmed":
        return (
          <Button 
            onClick={() => handleUpdateStatus("Shipping", "Đang giao hàng")} 
            disabled={loadingStatus}
            className="w-full bg-orange-500 hover:bg-orange-600 shadow-sm"
          >
            {loadingStatus ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Truck className="mr-2 w-4 h-4" />}
            BƯỚC 2: Giao cho Đơn vị vận chuyển
          </Button>
        );
      case "Shipping": 
        // ĐÃ SỬA: Shipper báo giao xong -> Chuyển sang trạng thái Delivered
        return (
          <Button 
            onClick={() => handleUpdateStatus("Delivered", "Đã giao hàng (Chờ khách xác nhận)")} 
            disabled={loadingStatus}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
          >
            {loadingStatus ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
            BƯỚC 3: Shipper báo Đã Giao Hàng
          </Button>
        );
      case "Delivered":
        // ĐÃ SỬA: Hiển thị thông báo chờ khách. Kèm một nút phụ để Admin ép Hoàn tất nếu khách quên bấm.
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-sm bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
              <Clock className="w-5 h-5 flex-shrink-0" /> KIỆN HÀNG ĐÃ GIAO - CHỜ KHÁCH XÁC NHẬN
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUpdateStatus("Completed", "Hoàn tất đơn hàng")} 
              className="text-xs text-gray-500 hover:text-green-600 mt-2"
            >
              Khách quên bấm xác nhận? Ép "Hoàn tất"
            </Button>
          </div>
        );
      case "Completed":
        return (
          <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-sm bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5" /> ĐƠN HÀNG ĐÃ HOÀN TẤT
          </div>
        );
      default:
        return (
            <Button 
            onClick={() => handleUpdateStatus("Confirmed", "Đang xử lý")} 
            disabled={loadingStatus}
            className="w-full"
          >
            Bắt đầu xử lý đơn hàng
          </Button>
        );
    }
  };

  // Helper để dịch trạng thái ra tiếng Việt cho đẹp
  const translateStatus = (status: string) => {
    switch(status) {
      case "Pending": return "Chờ xác nhận";
      case "Confirmed": return "Đã xác nhận";
      case "Shipping": return "Đang giao hàng";
      case "Delivered": return "Đã giao hàng"; // Trạng thái mới
      case "Completed": return "Hoàn tất";
      case "Cancelled": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex justify-between border-b pb-4">
          <DialogTitle className="text-xl">
            Đơn hàng <span className="text-primary font-mono">#{orderId?.slice(-6).toUpperCase()}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Thông tin khách hàng & Giao hàng */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          
          <div className="md:col-span-7 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Khách hàng</h4>
              <p className="text-sm font-medium">{order.user?.name || "Khách vãng lai"}</p>
              <p className="text-sm text-gray-500">{order.user?.email || "Không có email"}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Thông tin giao hàng</h4>
              <p className="text-sm"><strong>Người nhận:</strong> {order.shippingAddress?.recipient_name || order.user?.name}</p>
              <p className="text-sm mt-1"><strong>SĐT:</strong> <span className="font-mono font-bold text-primary">{order.shippingAddress?.phone}</span></p>
              <p className="text-sm mt-1 text-gray-600">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

              <div>
                <h4 className="font-bold text-base text-gray-900 mb-4 uppercase tracking-wide border-b pb-2">Tiến trình xử lý</h4>
                
                <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4"/> Trạng thái:</span>
                  <Badge variant="outline" className="text-[13px] font-semibold uppercase">
                    {translateStatus(order.status)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                  </span>
                  {order.isPaid ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Đã thanh toán</Badge>
                  ) : (
                    <Badge variant="destructive">Chưa thu tiền</Badge>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-3">
                {!order.isPaid && order.status !== "Cancelled" && (
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={loadingPay}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {loadingPay ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <CheckCircle className="mr-2 w-4 h-4" />}
                    Đánh dấu Đã Thanh Toán
                  </Button>
                )}

                {renderNextStepAction()}
              </div>

            </div>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        <div className="mt-6 border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 font-medium">Sản phẩm</th>
                <th className="p-3 font-medium text-center">SL</th>
                <th className="p-3 font-medium text-right">Đơn giá</th>
                <th className="p-3 font-medium text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.orderItems.map((item: any) => (
                <tr key={item._id}>
                  <td className="p-3 flex gap-3 items-center">
                    <img src={item.image} className="w-10 h-10 object-cover rounded border bg-white" alt="" />
                    <span className="font-medium text-gray-800 line-clamp-1 max-w-[300px]">{item.name}</span>
                  </td>
                  <td className="p-3 text-center font-semibold">{item.quantity}</td>
                  <td className="p-3 text-right text-gray-600">{item.price.toLocaleString()}đ</td>
                  <td className="p-3 text-right font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="p-4 text-right font-medium text-gray-600">Phí vận chuyển:</td>
                <td className="p-4 text-right font-bold text-gray-600">
                  {order.shippingPrice?.toLocaleString() || "0"}đ
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="p-4 pt-0 text-right font-bold text-gray-900 text-base">Tổng thu khách:</td>
                <td className="p-4 pt-0 text-right font-bold text-red-600 text-lg">
                  {order.totalPrice?.toLocaleString()}đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;