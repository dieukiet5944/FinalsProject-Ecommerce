import Axios from '../config/axios.js';

export const getUsersApi = () => {
  return Axios.get('/users'); 
};

export const putUsersApi = (userId, payload) => {
  return Axios.put(`/users/${userId}`, payload)
}

export const uploadAvatarToCloudApi = (formData) => {
    return Axios.post(`/users/upload-avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }); 
};

export const deleteUserApi = (userId) => {
  return Axios.delete(`/users/${userId}`); 
};