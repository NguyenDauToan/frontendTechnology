import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, MapPin, Phone, User, Clock, XCircle } from "lucide-react";

interface OrderDetailDialogProps {
  order: any;
}

const OrderDetailDialog = ({ order }: OrderDetailDialogProps) => {
  
  // Logic hiển thị Progress Bar (Timeline)
  const getProgressStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Shipping': return 3;
      case 'Completed': return 4;
      default: return 0;
    }
  };

  const currentStep = getProgressStep(order.status);
  const isCancelled = order.status === 'Cancelled';

  // Component Timeline Item
  const TimelineItem = ({ step, label, icon: Icon, activeStep }: any) => {
    const isActive = step <= activeStep;
    const isCurrent = step === activeStep;
    
    return (
      <div className={`flex flex-col items-center flex-1 relative z-10 ${isCancelled ? 'opacity-50' : ''}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
            ${isActive ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}
            ${isCurrent ? 'ring-4 ring-blue-100' : ''}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Xem chi tiết & Theo dõi</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết đơn hàng <Badge variant="outline">#{order._id.slice(-6).toUpperCase()}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
            {/* 1. PROGRESS BAR (TIMELINE) */}
            {!isCancelled ? (
                <div className="relative flex justify-between items-center px-2">
                    {/* Line nối background */}
                    <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-0" />
                    {/* Line nối active */}
                    <div 
                        className="absolute left-0 top-5 h-1 bg-primary -z-0 transition-all duration-500" 
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />

                    <TimelineItem step={1} label="Chờ xác nhận" icon={Clock} activeStep={currentStep} />
                    <TimelineItem step={2} label="Đã xác nhận" icon={Package} activeStep={currentStep} />
                    <TimelineItem step={3} label="Đang giao" icon={Truck} activeStep={currentStep} />
                    <TimelineItem step={4} label="Hoàn thành" icon={CheckCircle} activeStep={currentStep} />
                </div>
            ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center gap-2">
                    <XCircle /> Đơn hàng đã bị hủy
                </div>
            )}

            {/* 2. THÔNG TIN NGƯỜI NHẬN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Địa chỉ nhận hàng
                    </h4>
                    <p className="text-sm font-medium">{order.shippingAddress.recipient_name}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" /> Trạng thái thanh toán
                    </h4>
                    <p className="text-sm text-gray-600">Phương thức: <span className="font-medium">{order.paymentMethod}</span></p>
                    <p className="text-sm text-gray-600">
                        Trạng thái: {order.isPaid ? <span className="text-green-600 font-bold">Đã thanh toán</span> : <span className="text-orange-500 font-bold">Thanh toán khi nhận (COD)</span>}
                    </p>
                </div>
            </div>

            {/* 3. DANH SÁCH SẢN PHẨM */}
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Sản phẩm</h4>
                {order.orderItems.map((item: any) => (
                    <div key={item._id} className="flex gap-4 items-center border-b border-gray-100 pb-3 last:border-0">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover border" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()}đ</p>
                    </div>
                ))}
            </div>

            {/* 4. TỔNG TIỀN */}
            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{order.itemsPrice ? order.itemsPrice.toLocaleString() : "---"}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{order.shippingPrice ? order.shippingPrice.toLocaleString() : "---"}đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-dashed">
                    <span>Tổng cộng</span>
                    <span>{order.totalPrice.toLocaleString()}đ</span>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;