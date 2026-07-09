import Axios from '../config/axios.js';

export const getOrdersApiForAdmin = () => {
  return Axios.get('/orders/');
};

export const getOrdersApi = (customerId) => {
  return Axios.get(`/orders/${customerId}`);
};

export const getOrderBreakPageApi = (customerId, pageNumber, pageSize) => {
  return Axios.get(`/orders/user/${customerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
};

export const createOrderApi = (payload) => {
  return Axios.post('/orders', payload)
}

export const putOrderApi = (orderId, body) => {
  return Axios.put(`/orders/${orderId}`, body);
};

export const putStatusOrderApi = (orderId) => {
  return Axios.put(`/orders/changestate/${orderId}`)
}

export const deleteOrdersApi = (orderId) => {
  return Axios.delete(`/orders/${orderId}`)
}