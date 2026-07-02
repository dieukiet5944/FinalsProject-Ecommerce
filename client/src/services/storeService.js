import Axios from "../config/axios.js";


export const getStoreApi = () => {
  return Axios.get('/store');
};

export const createStoreApi = (payload) => {
  return Axios.post('/store', payload);
};