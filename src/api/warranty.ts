import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ================= AUTH =================
const getAuthConfig = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return {
        headers: {
            Authorization: `Bearer ${user?.token || ""}`,
        },
    };
};

// ================= UPLOAD IMAGE =================
export const uploadImageAPI = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${user?.token || ""}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.url;
};

// ================= PRODUCTS (MY PURCHASED) =================
export const fetchMyProductsAPI = async () => {
    const response = await axios.get(
        `${API_URL}/orders/my-products`,
        getAuthConfig()
    );

    return response.data;
};

// ================= WARRANTY =================

// ADMIN / STAFF

export const getTicketsAPI = async (keyword = "") => {
    const response = await axios.get(
        `${API_URL}/warranty?keyword=${keyword}`,
        getAuthConfig()
    );

    return response.data;
};

export const createTicketAPI = async (data: any) => {
    const response = await axios.post(
        `${API_URL}/warranty`,
        data,
        getAuthConfig()
    );

    return response.data;
};

export const updateTicketStatusAPI = async (id: string, data: any) => {
    const response = await axios.put(
        `${API_URL}/warranty/${id}/status`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// ================= USER =================

// Gửi yêu cầu bảo hành (có images)
export const createWarrantyRequestAPI = async (data: {
    productName: string;
    serialNumber?: string;
    phone: string;
    issueDescription: string;
    images?: string[];
}) => {
    const response = await axios.post(
        `${API_URL}/warranty/request`,
        data,
        getAuthConfig()
    );

    return response.data;
};

// Lấy ticket của tôi
export const getMyTicketsAPI = async () => {
    const response = await axios.get(
        `${API_URL}/warranty/my-tickets`,
        getAuthConfig()
    );

    return response.data;
};