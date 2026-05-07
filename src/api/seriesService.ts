import axios from "axios";

const API_URL = "http://localhost:5000/api/series";

export const fetchSeriesByBrand = async (brandId: string) => {
  const res = await axios.get(`${API_URL}?brand=${brandId}`);
  return res.data;
};

export const createSeriesAPI = async (data: {
  name: string;
  brand: string;
}) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const deleteSeriesAPI = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};