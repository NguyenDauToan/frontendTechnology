import { Search, ShoppingCart, User, MapPin, LogIn, UserPlus, LogOut, FileText, Settings, Menu, Wrench } from "lucide-react"; // Import thêm icon Wrench
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import CategorySlider from "@/pages/user/CategorySlider"; // Có thể bỏ nếu không dùng trong Header
import CartDrawer from "@/pages/user/CartDrawer";
// import WarrantyRequestPage from "@/pages/user/WarrantyRequestPage"; // Không cần import page ở đây
import { getCart } from "@/api/cartApi";

const Header = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCartCount = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      getCart()
        .then((data) => {
          if (data && data.items) {
            const validItems = data.items.filter((item: any) => item.product);
            const totalQuantity = validItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setCartCount(totalQuantity);
          } else {
            setCartCount(0);
          }
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-6">

            {/* --- KHU VỰC TRÁI: LOGO --- */}
            <div className="flex items-center gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-lg">HG</span>
                </div>
                <span className="font-bold text-xl text-foreground hidden lg:block tracking-tight">Huỳnh Gia</span>
              </Link>
            </div>

            {/* --- KHU VỰC GIỮA: SEARCH --- */}
            <div className="flex-1 max-w-2xl w-full">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Bạn đang tìm gì hôm nay?"
                  className="pl-10 h-10 w-full bg-gray-50 border-gray-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-full"
                />
              </div>
            </div>

            {/* --- KHU VỰC PHẢI: ACTIONS --- */}
            <div className="flex items-center gap-2 shrink-0">

              {/* ACCOUNT DROPDOWN */}
              <div className="relative group hidden md:block">
                <Button variant="ghost" className="gap-2 px-2 hover:bg-gray-100/50 h-10">
                  {userInfo ? (
                    // ĐÃ ĐĂNG NHẬP
                    <>
                      {userInfo.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt="Avatar"
                          className="w-7 h-7 rounded-full object-cover border border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-semibold max-w-[100px] lg:max-w-[150px] truncate leading-none">
                          {userInfo.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-none mt-1">
                          Thành viên
                        </span>
                      </div>
                    </>
                  ) : (
                    // CHƯA ĐĂNG NHẬP
                    <>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-semibold">Tài khoản</span>
                        <span className="text-[10px] text-muted-foreground">Đăng nhập / Đăng ký</span>
                      </div>
                    </>
                  )}
                </Button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-[95%] pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden p-1.5 ring-1 ring-black/5">

                    {userInfo ? (
                      <>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userInfo.name}</p>
                          <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                        </div>

                        {userInfo.role === 'admin' && (
                          <Link to="/admin">
                            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-md cursor-pointer transition-colors">
                              <Settings className="h-4 w-4" />
                              Trang quản trị
                            </div>
                          </Link>
                        )}

                        <Link to="/profile">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors group/item">
                            <div className="p-1.5 bg-gray-100 rounded-md group-hover/item:bg-white border border-transparent group-hover/item:border-gray-200 transition-all">
                              <User className="h-4 w-4 text-gray-500 group-hover/item:text-gray-700" />
                            </div>
                            Hồ sơ cá nhân
                          </div>
                        </Link>

                        <Link to="/addresses">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors group/item">
                            <div className="p-1.5 bg-blue-50 rounded-md group-hover/item:bg-white border border-transparent group-hover/item:border-blue-100 transition-all">
                              <MapPin className="h-4 w-4 text-blue-500 group-hover/item:text-blue-600" />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-700">Sổ địa chỉ</span>
                              <span className="block text-[10px] text-gray-400 font-normal leading-none mt-0.5">Quản lý giao hàng</span>
                            </div>
                          </div>
                        </Link>

                        <Link to="/orders">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors group/item">
                            <div className="p-1.5 bg-gray-100 rounded-md group-hover/item:bg-white border border-transparent group-hover/item:border-gray-200 transition-all">
                              <FileText className="h-4 w-4 text-gray-500 group-hover/item:text-gray-700" />
                            </div>
                            Đơn hàng của tôi
                          </div>
                        </Link>

                        {/* --- MỤC MỚI THÊM: BẢO HÀNH --- */}
                        <Link to="/warrantypage">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors group/item">
                            <div className="p-1.5 bg-orange-50 rounded-md group-hover/item:bg-white border border-transparent group-hover/item:border-orange-100 transition-all">
                              <Wrench className="h-4 w-4 text-orange-500 group-hover/item:text-orange-600" />
                            </div>
                            Bảo hành & Sửa chữa
                          </div>
                        </Link>
                        {/* ---------------------------------- */}

                        <div className="h-[1px] bg-gray-100 my-1"></div>

                        <div
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login">
                          <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                            <LogIn className="h-4 w-4 text-primary" />
                            Đăng nhập
                          </div>
                        </Link>

                        <Link to="/register">
                          <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                            <UserPlus className="h-4 w-4 text-green-600" />
                            Đăng ký tài khoản
                          </div>
                        </Link>
                      </>
                    )}

                  </div>
                </div>
              </div>

              {/* CART BUTTON */}
              <Button
                variant="ghost"
                className="relative w-10 h-10 rounded-full hover:bg-gray-100/50"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 min-w-[16px] px-0.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default Header;