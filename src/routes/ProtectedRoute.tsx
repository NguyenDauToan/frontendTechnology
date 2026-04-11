import { Navigate, Outlet } from "react-router-dom";

// Giả lập hàm kiểm tra auth. 
// Trong thực tế, bạn sẽ lấy thông tin này từ Context, Redux hoặc LocalStorage
const useAuth = () => {
  // TODO: Thay thế logic này bằng logic auth thật của bạn
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;

  return {
    isAuthenticated: !!parsedUser,
    role: parsedUser?.role || "guest", // 'admin' hoặc 'user'
  };
};

const ProtectedRoute = () => {
  const { isAuthenticated, role } = useAuth();

  // 1. Nếu chưa đăng nhập -> Chuyển về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng không phải admin -> Chuyển về trang chủ hoặc trang báo lỗi 403
  if (role !== "admin") {
    return <Navigate to="/" replace />; // Hoặc trang /unauthorized
  }

  // 3. Nếu hợp lệ -> Cho phép truy cập (Render các route con)
  return <Outlet />;
};

export default ProtectedRoute;