import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000"
});

// 👇 THÊM ĐOẠN NÀY
API.interceptors.request.use((config) => {
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

    if (userInfo?.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
});

export const fetchRevenueStats = async (type: 'daily' | 'monthly') => {
    const response = await API.get(`/api/analytics/revenue?type=${type}`);
    return response.data;
};