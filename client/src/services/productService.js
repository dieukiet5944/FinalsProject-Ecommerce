import Axios from '../config/axios.js';

export const getProductsApi = () => Axios.get('/products');

export const getProductsIdApi = (productId) => {
    return Axios.get(`/products/${productId}`)
}

export const putProductsApi = async (payload, productId) => { 
   const response = await Axios.put(`/products/${productId}`, payload);
   return response.data; 
}

export const createProductApi = async (productPayload) => {
  const response = await Axios.post('/products', productPayload);
  return response.data
}; 

export const deleteProductsApi = (productId) => {
    return Axios.delete(`/products/${productId}`);
}

export const deleteBatchsApi = (productId, batchId) => {
    return Axios.delete(`/products/${productId}/${batchId}`);
}