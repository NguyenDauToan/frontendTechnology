import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000"
});

// attach token
API.interceptors.request.use((config) => {

    const userInfo = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    if (userInfo?.token) {
        config.headers.Authorization =
            `Bearer ${userInfo.token}`;
    }

    return config;
});

// fetch revenue stats
export const fetchRevenueStats = async (
    type: 'daily' | 'monthly',
    fromDate?: string,
    toDate?: string
) => {

    const params = new URLSearchParams();

    params.append("type", type);

    if (fromDate) {
        params.append("fromDate", fromDate);
    }

    if (toDate) {
        params.append("toDate", toDate);
    }

    const response = await API.get(
        `/api/analytics/revenue?${params.toString()}`
    );

    return response.data;
};