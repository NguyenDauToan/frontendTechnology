import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.token) return {};

    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
  } catch {
    return {};
  }
};

// --- PHẦN ADMIN ---

// 1. Lấy tất cả đơn hàng (Admin)
export const fetchOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`, getAuthHeader());
  return response.data; 
};
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await axios.put(
    `${API_URL}/orders/${orderId}/status`,
    { status },
    getAuthHeader()
  );
  return response.data;
};
export const confirmOrder = async (orderId: string) => {
  const res = await axios.put(`${API_URL}/orders/${orderId}/confirm`, {}, getAuthHeader());
  return res.data;
};
// 2. Lấy chi tiết 1 đơn hàng
export const fetchOrderDetail = async (id: string) => {
  const response = await axios.get(`${API_URL}/orders/${id}`, getAuthHeader());
  return response.data;
};

// 3. Xác nhận thanh toán (Kích hoạt bảo hành)
export const markOrderAsPaid = async (id: string) => {
  const response = await axios.put(`${API_URL}/orders/${id}/pay`, {}, getAuthHeader());
  return response.data;
};

// --- PHẦN USER (BỔ SUNG THÊM) ---

// 4. Tạo đơn hàng mới
export const createOrder = async (orderData: any) => {
  const response = await axios.post(`${API_URL}/orders`, orderData, getAuthHeader());
  return response.data;
};

// 5. Lấy lịch sử mua hàng của tôi
export const getMyOrders = async () => {
  const response = await axios.get(`${API_URL}/orders/myorders`, getAuthHeader());
  return response.data;
};
export const cancelOrder = async (id: string) => {
  const response = await axios.put(
    `${API_URL}/orders/${id}/status`,
    { status: "Cancelled" },
    getAuthHeader()
  );
  return response.data;
};