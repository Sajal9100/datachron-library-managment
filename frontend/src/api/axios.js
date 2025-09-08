import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://datachron-library-managment-2.onrender.com/api",
});


export default axiosInstance;
