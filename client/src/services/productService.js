import Axios from '../config/axios.js';

export const getProductsApi = () => Axios.get('/products');

export const getProductsIdApi = (productId) => {
    return Axios.get(`/products/${productId}`)
}

export const getProductsSlugApi = (slug) => {
    return Axios.get(`/products/${slug}`)
}

export const putProductsApi =  (payload, productId) => { 
   return Axios.put(`/products/${productId}`, payload); 
}

export const uploadTocloud = (formData) => {
    return Axios.post(`/products/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    }); 
}

export const createProductApi =  (productPayload) => {
  return Axios.post('/products', productPayload);
}; 

export const deleteProductsApi = (productId) => {
    return Axios.delete(`/products/${productId}`);
}

export const deleteBatchsApi = (productId, batchId) => {
    return Axios.delete(`/products/expired/${productId}/${batchId}`);
}