import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Archive, // 1. Import icon Archive cho kho,
  UserCog,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard, path: "/admin" },
  { id: "products", label: "Sản phẩm", icon: Package, path: "/admin/products" },
  { id: "categories", label: "Danh mục", icon: Tags, path: "/admin/categories" },
  // 2. Thêm mục Quản lý kho vào đây
  { id: "warehouse", label: "Quản lý kho", icon: Archive, path: "/admin/warehousePage" },
  { id: "orders", label: "Đơn hàng", icon: ShoppingCart, path: "/admin/orders" },
  { id: "staff", label: "Nhân viên", icon: UserCog, path: "/admin/users" },
  { id: "customers", label: "Khách hàng", icon: Users, path: "/admin/customers" },
  { id: "analytics", label: "Thống kê", icon: BarChart3, path: "/admin/analytics" },
  { id: "settings", label: "Cài đặt", icon: Settings, path: "/admin/settings" },
  { id: "warranty", label: "Bảo hành", icon: Wrench, path: "/admin/warranty" },
];

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("Đã đăng xuất hệ thống");
    window.location.href = "/login";
  };

  return (
    <aside
      className={cn(
        "min-h-screen bg-sidebar border-r-2 border-sidebar-border flex flex-col transition-all duration-300 fixed left-0 top-0 z-20",
        "overflow-hidden whitespace-nowrap",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b-2 border-sidebar-border flex items-center justify-between h-16">
        <div className={cn("transition-opacity duration-200", collapsed ? "opacity-0 w-0" : "opacity-100")}>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">
                HUỲNH GIA
              </h1>
              <p className="text-xs text-sidebar-foreground/70 mt-0.5">
                Quản lý sản phẩm
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className={cn(
            "p-2 bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors rounded-sm",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "sidebar-item w-full text-left rounded-sm mx-1 mb-1 flex items-center p-2 transition-colors",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", !collapsed && "mr-2")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-2 border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "sidebar-item w-full text-left text-sidebar-foreground/70 hover:text-destructive rounded-sm flex items-center p-2 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className={cn("w-5 h-5 flex-shrink-0", !collapsed && "mr-2")} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;