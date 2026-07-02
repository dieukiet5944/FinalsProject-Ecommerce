import Axios from "../config/axios.js";

export const loginAdminApi = (email, password) => {
   return Axios.post('/secret-key/admin/login', { email, password });
};

export const putAdminApi = (adminId, adminPayload) => {
  return  Axios.put(`/secret-key/admin/${adminId}`, adminPayload);
}

export const logoutAdminApi = (adminId) => {
  return  Axios.post(`/secret-key/admin/${adminId}/logout`); 
};

export const loginUserApi = (email, password) => {
  return  Axios.post('/users/login', { email, password }); 
};

export const logoutUserApi =  (userId) => {
  return  Axios.post(`/users/${userId}/logout`); 
};
