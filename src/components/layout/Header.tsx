import { useEffect, useState, useRef } from "react";
import { Bell, Search, User, Package, X, AlertTriangle, LogOut, Settings, UserCircle } from "lucide-react";
import { fetchLowStockProducts } from "@/api/productService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  // --- Notification State ---
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // --- User Menu State ---
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // --- USER INFO STATE (MỚI) ---
  const [currentUser, setCurrentUser] = useState({
    name: "Admin",
    email: "admin@huynhgia.com",
    role: "Quản trị viên"
  });

  const navigate = useNavigate();

  // 1. Load User Info & Notification Data
  useEffect(() => {
    // A. Lấy thông tin user từ LocalStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser({
                name: parsedUser.name || "Admin",
                email: parsedUser.email || "admin@huynhgia.com",
                role: parsedUser.isAdmin ? "Quản trị viên" : "Nhân viên"
            });
        } catch (error) {
            console.error("Lỗi đọc thông tin user", error);
        }
    }

    // B. Load thông báo tồn kho
    const loadNotifications = async () => {
      try {
        const data = await fetchLowStockProducts();
        if (Array.isArray(data)) {
            setLowStockCount(data.length);
            const formattedNotifs = data.map((item: any) => ({
                id: item._id || item.id,
                title: "Cảnh báo tồn kho",
                message: `Sản phẩm "${item.name}" sắp hết (${item.stock})`,
                time: "Hiện tại",
                type: "warning",
                link: "/admin/warehouse"
            }));
            setNotifications(formattedNotifs);
        }
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
      }
    };
    loadNotifications();
  }, []);

  // 2. Handle Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (link: string) => {
    setIsNotifOpen(false);
    navigate(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Xóa cả token nếu có
    toast.info("Đã đăng xuất");
    window.location.href = "/login";
  };

  return (
    <header className="h-16 bg-card border-b-2 border-border flex items-center justify-between px-6 sticky top-0 z-40 bg-white">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 h-10 w-64 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* --- NOTIFICATION DROPDOWN --- */}
        <div className="relative" ref={notifDropdownRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 border rounded-md transition-colors ${
                    isNotifOpen ? "bg-gray-100 border-gray-300" : "border-transparent hover:bg-gray-100"
                }`}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-sm text-gray-900">Thông báo ({lowStockCount})</h3>
                        <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-sm">Không có thông báo mới</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif.link)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer flex gap-3 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            {notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                {notif.time}
                                            </p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t bg-gray-50 text-center">
                        <Link 
                            to="/admin/notifications" 
                            onClick={() => setIsNotifOpen(false)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Xem tất cả thông báo
                        </Link>
                    </div>
                </div>
            )}
        </div>

        {/* --- USER DROPDOWN (ĐÃ CẬP NHẬT THÔNG TIN) --- */}
        <div className="relative pl-4 border-l border-gray-200" ref={userDropdownRef}>
            <button 
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none"
            >
                {/* Hiển thị tên & role trên thanh Header */}
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
                <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full text-white shadow-sm ring-2 ring-transparent hover:ring-gray-200 transition-all">
                    <User className="w-5 h-5" />
                </div>
            </button>

            {/* User Dropdown Menu */}
            {isUserOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    
                    {/* Header của Dropdown: Hiển thị tên & email chi tiết */}
                    <div className="p-4 border-b bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                    </div>
                    
                    <div className="p-1">
                        <Link 
                            to="/admin/settings" 
                            onClick={() => setIsUserOpen(false)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <UserCircle className="w-4 h-4 text-gray-500" />
                            Hồ sơ cá nhân
                        </Link>
                        <Link 
                            to="/admin/settings" 
                            onClick={() => setIsUserOpen(false)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <Settings className="w-4 h-4 text-gray-500" />
                            Cài đặt hệ thống
                        </Link>
                    </div>
                    <div className="p-1 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;