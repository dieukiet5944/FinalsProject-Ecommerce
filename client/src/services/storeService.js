import Axios from "../config/axios.js";


export const getStoreApi = () => {
  return Axios.get('/store');
};

export const createStoreApi = (payload) => {
  return Axios.post('/store', payload);
};

export const updateStoreApi = (storeId, payload) => {
  return Axios.put(`/store/${storeId}`, payload);
};

export const deleteStoreApi = (storeId) => {
  return Axios.delete(`/store/${storeId}`);
};