import axios from "axios";

const API_URL = "http://localhost:5000/api";

// 👉 Lấy token (giống productService)
const getAuthHeader = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    headers: {
      Authorization: `Bearer ${user?.token || ""}`,
    },
  };
};

// ===============================
// 🔥 BRAND APIs
// ===============================

// 1. Lấy tất cả brand
export const fetchBrands = async () => {
  const res = await axios.get(`${API_URL}/brands`);
  return res.data;
};

// 2. Tạo brand (admin)
export const createBrandAPI = async (data: any) => {
  const res = await axios.post(
    `${API_URL}/brands`,
    data,
    getAuthHeader()
  );
  return res.data;
};

// 3. Update brand
export const updateBrandAPI = async (id: string, data: any) => {
  const res = await axios.put(
    `${API_URL}/brands/${id}`,
    data,
    getAuthHeader()
  );
  return res.data;
};

// 4. Xóa brand
export const deleteBrandAPI = async (id: string) => {
  const res = await axios.delete(
    `${API_URL}/brands/${id}`,
    getAuthHeader()
  );
  return res.data;
};