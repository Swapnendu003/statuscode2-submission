import axios from "axios";

const api = axios.create({
  baseURL: "https://statuscode2-submission.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
