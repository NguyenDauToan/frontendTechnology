import axios from 'axios';

// 1. Đặt đường dẫn gốc là /api (KHÔNG thêm /products vào đây)
const API_URL = 'http://localhost:5000/api'; 

// Hàm lấy token
const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { headers: { Authorization: `Bearer ${user?.token || ''}` } };
};

export const uploadImageAPI = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
};

// --- CÁC HÀM SẢN PHẨM ---

export const fetchProducts = async () => {
    const response = await axios.get(`${API_URL}/products`, getAuthHeader());
    return response.data; 
};

export const fetchProductById = async (id: string) => {
    const response = await axios.get(`${API_URL}/products/${id}`, getAuthHeader());
    return response.data;
};
export const createProductAPI = async (productData: any) => {
    // Gọi vào: POST http://localhost:5000/api/products
    const response = await axios.post(`${API_URL}/products`, productData, getAuthHeader());
    return response.data;
};
export const updateProductAPI = async (id: string, productData: any) => {
    // PUT http://localhost:5000/api/products/:id
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const headers = { Authorization: `Bearer ${user?.token || ''}` };

    const response = await axios.put(`http://localhost:5000/api/products/${id}`, productData, { headers });
    return response.data;
};
export const deleteProductAPI = async (id: string) => {
    // Gọi vào: DELETE http://localhost:5000/api/products/:id
    const response = await axios.delete(`${API_URL}/products/${id}`, getAuthHeader());
    return response.data;
};

// --- CÁC HÀM DANH MỤC ---

export const fetchCategories = async () => {
    // Gọi vào: http://localhost:5000/api/categories
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};
export const fetchLowStockProducts = async () => {
    const response = await axios.get(`${API_URL}/products/low-stock`, getAuthHeader());
    return response.data;
};
export const restockProductAPI = async (id: string, newStock: number) => {
    const response = await axios.put(
        `${API_URL}/products/${id}`,
        { stock: newStock },
        getAuthHeader()
    );
    return response.data;
};
export const getProductsByCategory = async (slug: string) => {
    const response = await axios.get(`${API_URL}/products?category=${slug}`, getAuthHeader());
    return response.data;
};
export const fetchProductsByCategory = async (slug: string) => {
    const response = await axios.get(`${API_URL}/products/category/${slug}`, getAuthHeader());
    return response.data;
};

export const fetchFilteredProducts = async (params: any) => {
    const response = await axios.get(`${API_URL}/products`, { ...getAuthHeader(), params });
    return response.data;
};
export const fetchMyProductsAPI = async () => {
    const response = await axios.get(`${API_URL}/orders/my-products`, getAuthHeader());
    return response.data;
};