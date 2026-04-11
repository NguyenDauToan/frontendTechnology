// src/api/adminApi.ts
import axios from "axios";

// Trỏ thẳng vào route admin
const ADMIN_URL = "http://localhost:5000/api/admin";

// Helper lấy token (Copy từ các file khác sang)
const getConfig = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { headers: { Authorization: `Bearer ${user.token}` } };
};

// ==========================================
// 1. QUẢN LÝ USER (NHÂN VIÊN/KHÁCH HÀNG)
// ==========================================

export const getAdminUsers = async () => {
    const response = await axios.get(`${ADMIN_URL}/users`, getConfig());
    return response.data;
};

export const createAdminUser = async (userData: any) => {
    const response = await axios.post(`${ADMIN_URL}/users`, userData, getConfig());
    return response.data;
};

export const updateAdminUser = async (id: string, userData: any) => {
    const response = await axios.put(`${ADMIN_URL}/users/${id}`, userData, getConfig());
    return response.data;
};

export const deleteAdminUser = async (id: string) => {
    const response = await axios.delete(`${ADMIN_URL}/users/${id}`, getConfig());
    return response.data;
};

// ==========================================
// 2. THỐNG KÊ DASHBOARD (Bonus thêm cho bạn)
// ==========================================
export const getDashboardStats = async () => {
    const response = await axios.get(`${ADMIN_URL}/dashboard`, getConfig());
    return response.data;
};