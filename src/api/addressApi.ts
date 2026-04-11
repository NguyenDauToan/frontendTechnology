import axios from "axios";

const API_URL = "http://localhost:5000/api/addresses";

// Hàm lấy Header chứa Token
const getConfig = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return {};
    
    const user = JSON.parse(userStr);
    return {
        headers: {
            Authorization: `Bearer ${user.token}`, // Gửi token lên server
        },
    };
};

export const getAddressesAPI = async () => {
    // Thêm getConfig() vào request GET
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

export const createAddressAPI = async (data: any) => {
    // Thêm getConfig() vào request POST
    const response = await axios.post(API_URL, data, getConfig());
    return response.data;
};

export const deleteAddressAPI = async (id: string) => {
    // Thêm getConfig() vào request DELETE
    const response = await axios.delete(`${API_URL}/${id}`, getConfig());
    return response.data;
};
export const updateAddressAPI = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getConfig());
    return response.data;
  };