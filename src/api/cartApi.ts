// src/api/cartApi.ts
import axios from "axios";

// Hàm lấy token từ localStorage để gửi kèm request
const getAuthHeader = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const { token } = JSON.parse(user);
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return {};
};

const API_URL = "http://localhost:5000/api/cart";

export const getCart = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data; // Trả về object Cart { _id, items: [...], user }
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await axios.post(API_URL, { productId, quantity }, getAuthHeader());
  return response.data;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  const response = await axios.put(`${API_URL}/${productId}`, { quantity }, getAuthHeader());
  return response.data;
};

export const removeFromCart = async (productId: string) => {
  const response = await axios.delete(`${API_URL}/${productId}`, getAuthHeader());
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete(API_URL, getAuthHeader());
  return response.data;
};