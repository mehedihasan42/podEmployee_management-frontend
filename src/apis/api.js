import axios from "axios";

const api = axios.create({
    baseURL: "https://podemployee-management-backend.onrender.com/",
});


api.interceptors.request.use(
    (config) => {

        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


export default api;