import axios from "axios";

const api = axios.create({
  baseURL: "https://bob-server-side.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
