import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Lấy header auth từ localStorage
const getAuthHeader = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  if (user?.token) {
    return { headers: { Authorization: `Bearer ${user.token}` } };
  }
  return {};
};

// USERS
export const loginUser = async (credentials: any) => {
  const res = await axios.post(`${API_BASE}/users/login`, credentials);
  return res.data;
};

export const registerUser = async (userData: any) => {
  const res = await axios.post(`${API_BASE}/users/register`, userData);
  return res.data;
};

export const getProfileAPI = async () => {
  const res = await axios.get(`${API_BASE}/users/profile`, getAuthHeader());
  return res.data;
};

export const updateProfileAPI = async (userData: any) => {
  const res = await axios.put(`${API_BASE}/users/profile`, userData, getAuthHeader());
  return res.data;
};

