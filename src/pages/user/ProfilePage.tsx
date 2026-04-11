import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { getProfileAPI } from "@/api/authApi";
import Header from "@/components/layout/user/Header";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Phone, MapPin, Shield, LogOut, Camera, ChevronRight, Edit2 } from "lucide-react";
import { toast } from "sonner";
import PromoBanner from "./PromoBanner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileAPI();
        setUser(data);
        localStorage.setItem("user", JSON.stringify({ ...data, token: JSON.parse(localStorage.getItem("user") || "{}").token }));
      } catch (error) {
        toast.error("Phiên đăng nhập hết hạn");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("Đã đăng xuất");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromoBanner/>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-500 text-sm">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Avatar & Quick Actions */}
            <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-4 border-white shadow-lg overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100 group-hover:bg-gray-50 transition-colors">
                            <Camera className="w-4 h-4 text-gray-600" />
                        </div>
                    </div>
                    
                    <h2 className="mt-4 font-bold text-lg text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    
                    <div className="mt-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            user.role === 'admin' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </span>
                    </div>
                </div>

                {/* Sổ địa chỉ Link (Mới thêm) */}
                <Link to="/addresses">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-semibold text-gray-900">Sổ địa chỉ</h4>
                                <p className="text-xs text-gray-500">Quản lý địa chỉ giao hàng</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                </Link>

                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Thông tin chi tiết</h3>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                            <Edit2 className="w-3 h-3" /> Chỉnh sửa
                        </Button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Name */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Họ và tên</label>
                                <p className="text-gray-900 font-medium mt-0.5">{user.name}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                <p className="text-gray-900 font-medium mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                                <p className="text-gray-900 font-medium mt-0.5">{user.phone || "Chưa cập nhật"}</p>
                            </div>
                        </div>

                        {/* Address (Update Link) */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Địa chỉ mặc định</label>
                                </div>
                                <p className="text-gray-900 font-medium mt-0.5">{user.address || "Chưa thiết lập địa chỉ mặc định"}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vai trò hệ thống</label>
                                <p className="text-gray-900 font-medium mt-0.5 uppercase">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <span className="block text-2xl font-bold text-gray-900">0</span>
                        <span className="text-xs text-gray-500">Đơn hàng đã mua</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <span className="block text-2xl font-bold text-gray-900">0</span>
                        <span className="text-xs text-gray-500">Mã giảm giá</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;