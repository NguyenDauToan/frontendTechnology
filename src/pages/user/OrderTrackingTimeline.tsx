import { CheckCircle2, Circle, Truck, Package, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineProps {
  order: any;
}

const OrderTrackingTimeline = ({ order }: TimelineProps) => {
  
  // Helper: Format giờ và ngày
  const formatTimeDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const day = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    
    return (
      <div className="flex flex-col items-end text-xs text-gray-500">
        <span className="font-bold text-gray-700">{time}</span>
        <span>{day}</span>
      </div>
    );
  };

  // Logic: Xây dựng danh sách các sự kiện. ĐÃ BỔ SUNG "Delivered" VÀO CÁC MẢNG CHECK
  let events = [
    {
      status: "Pending",
      title: "Đơn hàng đã được đặt",
      desc: "Người gửi đang chuẩn bị hàng",
      time: order.createdAt,
      active: true,
      icon: Clock
    },
    {
      status: "Confirmed",
      title: "Đơn hàng đã được xác nhận",
      desc: "Kiện hàng đã được đóng gói và chờ bàn giao",
      time: ["Confirmed", "Shipping", "Delivered", "Completed"].includes(order.status) ? order.updatedAt : null,
      active: ["Confirmed", "Shipping", "Delivered", "Completed"].includes(order.status),
      icon: Package
    },
    {
      status: "Shipping",
      title: "Đang giao hàng",
      desc: "Shipper đang giao hàng cho bạn. Vui lòng chú ý điện thoại.",
      time: ["Shipping", "Delivered", "Completed"].includes(order.status) ? order.updatedAt : null,
      active: ["Shipping", "Delivered", "Completed"].includes(order.status),
      icon: Truck
    },
    {
      status: "Delivered",
      title: "Đã giao hàng",
      desc: "Kiện hàng đã được giao thành công. Vui lòng xác nhận nhận hàng.",
      time: ["Delivered", "Completed"].includes(order.status) ? order.updatedAt : null,
      active: ["Delivered", "Completed"].includes(order.status),
      icon: CheckCircle2
    },
    {
      status: "Completed",
      title: "Đơn hàng hoàn tất",
      desc: "Cảm ơn bạn đã mua sắm tại Huỳnh Gia!",
      time: order.status === "Completed" ? order.updatedAt : null,
      active: order.status === "Completed",
      icon: CheckCircle2
    }
  ];

  if (order.status === 'Cancelled') {
      events.push({
          status: "Cancelled",
          title: "Đã hủy đơn hàng",
          desc: "Đơn hàng đã bị hủy theo yêu cầu.",
          time: order.updatedAt,
          active: true,
          icon: Circle
      });
  }

  const activeEvents = events.filter(e => e.active);
  const reversedEvents = [...activeEvents].reverse();

  return (
    <div className="pl-2 pr-4 py-4 bg-white rounded-lg">
      <div className="relative border-l-2 border-gray-200 ml-[60px] space-y-8 my-2 pb-2">
        {reversedEvents.map((event, index) => {
          const isLatest = index === 0; 
          
          return (
            <div key={index} className="relative flex items-start group">
              <div className="absolute -left-[70px] top-0 w-[50px] text-right">
                {event.time ? formatTimeDate(event.time) : <span className="text-xs text-gray-400">--:--</span>}
              </div>

              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 
                  ${isLatest ? 'bg-green-500 border-green-500 ring-4 ring-green-100' : 'bg-gray-200 border-gray-200'}
                  flex items-center justify-center bg-white z-10 transition-all`}
              >
              </div>

              <div className="ml-6 -mt-1">
                <h4 className={`text-sm font-bold ${isLatest ? 'text-green-600 text-base' : 'text-gray-900'}`}>
                  {event.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {event.desc}
                </p>
                
                {isLatest && order.status === 'Shipping' && (
                   <Badge className="mt-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200">
                      Shipper đang đến
                   </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;