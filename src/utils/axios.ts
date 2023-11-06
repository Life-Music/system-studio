import axios from "axios";
import router from "@/router";
import routerNames from "@/router/routerNames";
import { message } from 'ant-design-vue';

const requestInstance = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
})

requestInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token && !Object.hasOwnProperty.call(config.headers, "Authorization")) config.headers.Authorization = `Bearer ${token}`
  return config
})

requestInstance.interceptors.response.use((response) => response, (error) => {
  try {
    const { response } = error;
    if (response) {
      const { status } = response;
      message.error(response.data?.error || "Something went wrong!")
      if (status === 401) {
        localStorage.removeItem("access_token");
        router.push({ name: routerNames.AUTH });
      }
      return
    }
  } catch (e) {
    // Some thing went wrong
  }
  message.error("Something went wrong!");
})

export default requestInstance