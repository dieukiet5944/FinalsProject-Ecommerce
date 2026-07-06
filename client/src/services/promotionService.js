import Axios from "../config/axios.js";

export const validatePromoApi = (data) => {
    return Axios.post("/promotions/validate", data);
};

export const getAllPromosApi = () => {
    return Axios.get("/promotions");
};

export const createPromoApi = (data) => {
    return Axios.post("/promotions/create", data);
};

export const updatePromoApi = (id, data) => {
    return Axios.put(`/promotions/update/${id}`, data);
};

export const deletePromoApi = (id) => {
    return Axios.delete(`/promotions/delete/${id}`);
};