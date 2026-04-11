import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ===============================
// GET TOKEN SAFE
// ===============================
const getAuthHeader = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) return {};
    return {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
  } catch {
    return {};
  }
};

// ===============================
// GET ALL CATEGORIES
// ===============================
export const fetchCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
};

// ===============================
// CREATE CATEGORY (ADMIN)
// ===============================
export const createCategoryAPI = async (data: any) => {
  const res = await axios.post(
    `${API_URL}/categories`,
    data,
    getAuthHeader()
  );
  return res.data;
};

// ===============================
// UPDATE CATEGORY (ADMIN)
// ===============================
export const updateCategoryAPI = async (id: string, data: any) => {
  const res = await axios.put(
    `${API_URL}/categories/${id}`,
    data,
    getAuthHeader()
  );
  return res.data;
};

// ===============================
// DELETE CATEGORY (ADMIN)
// ===============================
export const deleteCategoryAPI = async (id: string) => {
  const res = await axios.delete(
    `${API_URL}/categories/${id}`,
    getAuthHeader()
  );
  return res.data;
};