import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const getAuthHeader = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    if (user?.token) {
      return { headers: { Authorization: `Bearer ${user.token}` } };
    }
    return {};
  };
  useEffect(() => {
    const orderId = params.get("orderId");
  
    if (orderId) {
      axios.put(
        `http://localhost:5000/api/orders/${orderId}/pay`,
        {}, // nếu không có body thì để object rỗng
        getAuthHeader() // <-- quan trọng: kèm token
      )
      .then(() => {
        toast.success("Thanh toán thành công!");
        setTimeout(() => navigate("/orders"), 2000);
      })
      .catch((err) => {
        console.error("Lỗi cập nhật thanh toán:", err.response?.data || err.message);
        toast.error("Thanh toán thành công nhưng cập nhật lỗi");
      });
    }
  }, []);
  return <h1 className="text-center mt-10">Đang xác nhận thanh toán...</h1>;
}