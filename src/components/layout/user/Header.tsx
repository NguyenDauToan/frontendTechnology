import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  LogIn,
  LogOut,
  FileText,
  Settings,
  Menu,
  Wrench,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useState,
  useEffect,
  useRef
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import axios from "axios";

import CartDrawer from "@/pages/user/CartDrawer";
import { getCart } from "@/api/cartApi";
import { fetchCategories } from "@/api/categoryService";

const Header = () => {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  // SEARCH
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);
  // =========================
  // CATEGORY
  // =========================
  useEffect(() => {
    fetchCategories()
      .then((data) => {
        const parents = data.filter((c: any) => !c.parent_id);

        const tree = parents.map((p: any) => ({
          ...p,
          children: data.filter(
            (c: any) =>
              (c.parent_id?._id || c.parent_id) === p._id
          )
        }));

        setCategories(tree);
      })
      .catch((err) =>
        console.error("Lỗi tải danh mục:", err)
      );
  }, []);

  // =========================
  // SEARCH SUGGEST
  // =========================
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!keyword.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products/search/suggest?q=${keyword}`
        );

        setSuggestions(data);
        setShowSuggest(true);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [keyword]);

  // =========================
  // CLICK OUTSIDE
  // =========================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggest(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================
  // CART
  // =========================
  const fetchCartCount = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      getCart()
        .then((data) => {
          if (data && data.items) {
            const validItems = data.items.filter(
              (item: any) => item.product
            );

            const totalQuantity = validItems.reduce(
              (acc: number, item: any) =>
                acc + item.quantity,
              0
            );

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

    const handleCartUpdate = () =>
      fetchCartCount();

    window.addEventListener(
      "cart-updated",
      handleCartUpdate
    );

    return () =>
      window.removeEventListener(
        "cart-updated",
        handleCartUpdate
      );
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserInfo(null);
    window.location.reload();
  };

  // =========================
  // SEARCH SUBMIT
  // =========================
  const handleSearch = (
    e?: React.FormEvent
  ) => {
    e?.preventDefault();

    if (!keyword.trim()) return;

    setShowSuggest(false);

    navigate(
      `/search?q=${encodeURIComponent(keyword)}`
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full
bg-gradient-to-r from-blue-50 via-white to-cyan-50
dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
border-b border-blue-100
backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">

          <div className="flex h-16 items-center justify-between gap-6">

            {/* LEFT */}
            <div className="flex items-center gap-4 shrink-0">

              {/* LOGO */}
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-lg">
                    HG
                  </span>
                </div>

                <span className="font-bold text-xl text-foreground hidden lg:block tracking-tight">
                  Huỳnh Gia
                </span>
              </Link>

              {/* MENU */}
              <div className="relative group h-16 flex items-center ml-2">

                <Button
                  variant="ghost"
                  className="gap-2 px-3 hover:bg-gray-100/50 h-10 font-bold text-gray-700"
                >
                  <Menu className="h-5 w-5" />

                  <span className="hidden sm:inline">
                    SẢN PHẨM
                  </span>
                </Button>

                {/* DROPDOWN */}
                <div className="absolute left-0 top-[100%] w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-[60]">

                  <div className="bg-white border border-gray-100 shadow-xl rounded-b-lg py-2">

                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="relative group/sub flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 cursor-pointer"
                        onClick={() =>
                          navigate(`/category/${cat.slug}`)
                        }
                      >

                        <span className="text-sm font-medium text-gray-700 group-hover/sub:text-primary">
                          {cat.name}
                        </span>

                        {cat.children?.length > 0 && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}

                        {/* CHILD */}
                        {cat.children?.length > 0 && (
                          <div className="absolute left-full top-0 w-60 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 pl-1">

                            <div className="bg-white border border-gray-100 shadow-xl rounded-lg py-2 min-h-full">

                              {cat.children.map((sub: any) => (
                                <div
                                  key={sub._id}
                                  className="px-4 py-2 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    navigate(
                                      `/category/${sub.slug}`
                                    );
                                  }}
                                >
                                  {sub.name}
                                </div>
                              ))}

                            </div>

                          </div>
                        )}

                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>

            {/* SEARCH */}
            <div className="flex-1 max-w-2xl w-full">

              <form
                onSubmit={handleSearch}
                className="relative"
                ref={searchRef}
              >

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Bạn đang tìm gì hôm nay?"
                  value={keyword}
                  onChange={(e) =>
                    setKeyword(e.target.value)
                  }
                  onFocus={() =>
                    setShowSuggest(true)
                  }
                  className="pl-10 pr-12 h-10 w-full bg-gray-50 border-gray-200 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-full"
                />

                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* SUGGESTIONS */}
                {showSuggest &&
                  suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">

                      {suggestions.map((item) => (
                        <Link
                          key={item._id}
                          to={`/product/${item._id}`}
                          onClick={() => {
                            setShowSuggest(false);
                            setKeyword("");
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >

                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg border"
                          />

                          <div className="flex-1 min-w-0">

                            <div className="text-sm font-medium line-clamp-2">
                              {item.name}
                            </div>

                            <div className="text-red-500 font-bold text-sm mt-1">
                              {item.price?.toLocaleString()}
                              ₫
                            </div>

                          </div>

                        </Link>
                      ))}

                    </div>
                  )}

              </form>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 shrink-0">

              {/* ACCOUNT */}
              <div className="relative group hidden md:block">

                <Button
                  variant="ghost"
                  className="gap-2 px-2 hover:bg-gray-100/50 h-10"
                >

                  {userInfo ? (
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
                    <>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>

                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-semibold">
                          Tài khoản
                        </span>

                        <span className="text-[10px] text-muted-foreground">
                          Đăng nhập / Đăng ký
                        </span>
                      </div>
                    </>
                  )}

                </Button>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-[95%] pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden p-1.5 ring-1 ring-black/5">

                    {userInfo ? (
                      <>
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-1">

                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {userInfo.name}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {userInfo.email}
                          </p>

                        </div>

                        {userInfo.role ===
                          "admin" && (
                            <Link to="/admin">
                              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-md cursor-pointer transition-colors">
                                <Settings className="h-4 w-4" />
                                Trang quản trị
                              </div>
                            </Link>
                          )}

                        <Link to="/profile">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                            <User className="h-4 w-4" />
                            Hồ sơ cá nhân
                          </div>
                        </Link>

                        <Link to="/addresses">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                            <MapPin className="h-4 w-4" />
                            Sổ địa chỉ
                          </div>
                        </Link>

                        <Link to="/orders">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                            <FileText className="h-4 w-4" />
                            Đơn hàng của tôi
                          </div>
                        </Link>

                        <Link to="/warrantypage">
                          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                            <Wrench className="h-4 w-4" />
                            Bảo hành & sửa chữa
                          </div>
                        </Link>

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
                      <Link to="/login">
                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                          <LogIn className="h-4 w-4 text-primary" />
                          Đăng nhập
                        </div>
                      </Link>
                    )}

                  </div>

                </div>

              </div>

              {/* CART */}
              <Button
                variant="ghost"
                className="relative w-10 h-10 rounded-full hover:bg-gray-100/50"
                onClick={() =>
                  setIsCartOpen(true)
                }
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