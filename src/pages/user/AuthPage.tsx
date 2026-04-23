import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, Loader2, ArrowRight, LogIn } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// Icon Google chuẩn màu (SVG)
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24"> 
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
    setShowPassword(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      (async () => {
        try {
          // Gọi API profile với token từ Google
          const { data } = await axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          // Lưu đầy đủ info vào LocalStorage
          const userData = {
            _id: data._id,
            token: token,
            role: data.role,
            name: data.name,
            email: data.email,
            avatar: data.avatar || "",
            phone: data.phone || ""
          };
          localStorage.setItem("user", JSON.stringify(userData));
  
          toast.success(`Đăng nhập Google thành công! Xin chào ${data.name}`);
          if (data.role === "admin") navigate("/admin");
          else navigate("/");
  
        } catch (err) {
          toast.error("Lỗi khi lấy thông tin user từ Google login");
        }
      })();
    }
  }, [searchParams, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/users/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!");
          setIsLoading(false);
          return;
        }
        await axios.post("http://localhost:5000/api/users/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      } else {
        const response = await axios.post("http://localhost:5000/api/users/login", {
          email: formData.email,
          password: formData.password
        });
        const userData = response.data;
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(`Xin chào, ${userData.name}!`);
        if (userData.role === "admin") navigate("/admin");
        else navigate("/");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || (isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-primary/5 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? "Đăng nhập để quản lý cửa hàng của bạn" : "Điền thông tin bên dưới để bắt đầu tham gia"}
          </p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="name" required={!isLogin} placeholder="Nguyễn Văn A" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={formData.name} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" name="phone" required={!isLogin} placeholder="0901234567" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" name="email" required placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                {isLogin && <a href="#" className="text-xs font-medium text-primary hover:underline">Quên mật khẩu?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••" className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" required={!isLogin} placeholder="••••••••" className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-70 mt-6">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {isLogin ? "Đăng nhập" : "Đăng ký ngay"} 
                  {isLogin ? <LogIn className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <GoogleIcon />
              <span>Đăng nhập bằng Google</span>
            </button>
          </div>

          <div className="mt-8 text-center pb-2">
            <p className="text-sm text-gray-600">
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button onClick={toggleMode} className="font-semibold text-primary hover:underline outline-none">
                {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;