import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- Layouts ---
import AdminLayout from "./pages/admin/AdminLayout";
import UserLayout from "./pages/user/UserLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// --- Admin Pages ---
import Dashboard from "./pages/admin/Dashboard";
import ProductPage from "./pages/admin/ProductPage";
import CategoryPage from "./pages/admin/CategoryPage";
import OrderPage from "./pages/admin/OrderPage";
import NotificationPage from "./pages/admin/NotificationPage";
import WarehousePage from "./pages/admin/WarehousePage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import UserList from "./pages/admin/UserList"; // <--- MỚI THÊM: Import trang quản lý nhân viên

// --- User Pages ---
import HomePage from "./pages/user/HomePage";
import AuthPage from "./pages/user/AuthPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import ProfilePage from "./pages/user/ProfilePage";
import AddressBookPage from "./pages/user/AddressBookPage";
import MyOrdersPage from "./pages/user/MyOrdersPage";
import WarrantyPage from "./pages/admin/WarrantyPage";
import WarrantyRequestPage from "./pages/user/WarrantyRequestPage";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import CategoryProductsPage from "./pages/user/CategoryProductsPage";
// --- Common ---
import NotFound from "./pages/admin/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          {/* =========================================
              PHẦN 1: PUBLIC ROUTES (KHÁCH HÀNG)
              Không cần đăng nhập cũng xem được
          ========================================= */} 
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Trang Login/Register nằm ngoài Layout */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/category/:slug" element={<CategoryProductsPage />} />
          {/* Các trang chức năng của User */}
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addresses" element={<AddressBookPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/warrantypage" element={<WarrantyRequestPage/>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          {/* =========================================
              PHẦN 2: PROTECTED ROUTES (QUẢN TRỊ VIÊN)
              Phải đăng nhập + Role Admin/Staff mới vào được
          ========================================= */}
          
          {/* Lớp bảo vệ: Check quyền trước */}
          <Route element={<ProtectedRoute />}>
            
            {/* Nếu qua được lớp bảo vệ -> Vào AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />              {/* /admin */}
              <Route path="products" element={<ProductPage />} />    {/* /admin/products */}
              <Route path="categories" element={<CategoryPage />} /> {/* /admin/categories */}
              <Route path="orders" element={<OrderPage />} />        {/* /admin/orders */}
              <Route path="notifications" element={<NotificationPage />} />
              <Route path="warehousePage" element={<WarehousePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="warranty" element={<WarrantyPage />} />
              {/* --- ROUTE MỚI CHO QUẢN LÝ NHÂN SỰ --- */}
              <Route path="users" element={<UserList />} />          {/* /admin/users */}
            </Route>

          </Route>


          {/* =========================================
              PHẦN 3: CÁC TRANG KHÁC
          ========================================= */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;