import Axios from '../config/axios.js';

export const getOrdersApi = () => {
  return Axios.get('/orders');
};

export const getOrderBreakPageApi = (pageNumber, pageSize) => {
  return Axios.get(`/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`)
}

export const createOrderApi = (payload) => {
  return Axios.post('/orders', payload)
}

export const putOrderApi = (orderId, status) => {
    return Axios.put(`/orders/${orderId}`, status);
}

export const putStatusOrderApi = (orderId) => {
    return Axios.put(`/orders/changestate/${orderId}`)
}

export const deleteOrdersApi = (orderId) => {
  return Axios.delete(`/orders/${orderId}`)
}