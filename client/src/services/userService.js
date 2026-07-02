import Axios from '../config/axios.js';

export const getUsersApi = () => {
  return Axios.get('/users'); 
};

export const putUsersApi = (userId, payload) => {
  return Axios.put(`/users/${userId}`, payload)
}

export const deleteUserApi = (userId) => {
  return Axios.delete(`/users/${userId}`); 
};