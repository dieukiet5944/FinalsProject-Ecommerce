import Axios from "../config/axios.js";

export const getCartApi = (customerId) => {
  return Axios.get(`/cart/${customerId}`); 
};

export const postCartApi = (customerId, payload) => {
  return Axios.post(`/cart/${customerId}`, payload)
}

export const deleteCartApi = (customerId, productId) => {
  return Axios.delete(`/cart/${customerId}/${productId}`)
}