import { User, ShieldCheck, Truck, RotateCcw, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RightSidebar = () => {
  // Mock user state (replace with your actual auth logic)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="flex flex-col gap-3 h-full">
      
      {/* 1. User Welcome Box */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"style={{marginBottom: "-10px"}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
            {user ? user.name.charAt(0).toUpperCase() : <User />}
          </div>
          <div>
            <p className="text-xs text-gray-500">Xin chào,</p>
            <p className="text-sm font-bold text-gray-800 line-clamp-1">
              {user ? user.name : "Khách hàng"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {user ? (
             <Button variant="outline" className="w-full text-xs h-8" asChild>
                <Link to="/profile">Hồ sơ</Link>
             </Button>
          ) : (
            <>
              <Button className="flex-1 text-xs h-8 bg-red-600 hover:bg-red-700" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button variant="outline" className="flex-1 text-xs h-8 border-red-200 text-red-600 hover:bg-red-50" asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Store Policies / Highlights */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex-1 flex flex-col justify-center gap-4"style={{marginBottom: "-10px"}}>
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Quyền lợi thành viên</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">Miễn phí vận chuyển</p>
              <p className="text-[10px] text-gray-500">Cho đơn hàng từ 500k</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">Bảo hành chính hãng</p>
              <p className="text-[10px] text-gray-500">100% sản phẩm chất lượng</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-700">Đổi trả dễ dàng</p>
              <p className="text-[10px] text-gray-500">Trong vòng 15 ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Small Promo Banner (Image) */}
      <div className="rounded-lg overflow-hidden h-32 shadow-sm relative group cursor-pointer">
        <img 
          src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&q=80" 
          alt="Promo" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-bold text-sm border border-white px-3 py-1 rounded">Xem ngay</span>
        </div>
      </div>

    </div>
  );
};

export default RightSidebar;