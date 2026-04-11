import axios from "axios";

export const fetchRevenueStats = async (type: 'daily' | 'monthly') => {
    // Gọi API: /api/analytics/revenue?type=daily
    const response = await axios.get(`/api/analytics/revenue?type=${type}`);
    return response.data;
};