import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Toast } from "@douyinfe/semi-ui-19";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "local";

const request: AxiosInstance = axios.create({
  // 💡 注意：如果 .env 里配置的是 /api，这里就直接用 BASE_URL
  // 避免出现 /api/api 的情况
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// 1. 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = Cookies.get("wms_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (APP_ENV === "local" || APP_ENV === "dev") {
      console.log(
        `%c [${APP_ENV.toUpperCase()} REQUEST]`,
        "color: #0070f3; font-weight: bold",
        {
          url: config.url,
          method: config.method,
          data: config.data,
          params: config.params,
        }
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    console.log("🚀 ~ res:", res);

    // 业务层级的错误处理 (HTTP 状态码为 200，但 code 不对)
    if (res.code !== 200 && res.code !== 0) {
      Toast.error({
        content: res.message || "业务请求失败",
        duration: 10,
      });
      return Promise.reject(new Error(res.message || "Business Error"));
    }
    return res;
  },
  (error) => {
    // 👇 重点优化：处理 HTTP 状态码非 200 的错误提示
    let message = "网络请求失败，请稍后重试";

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          message = data.message || "请求参数错误 (400)";
          break;
        case 401:
          message = "登录状态已失效，请重新登录 (401)";
          // 清除 token 并跳转
          Cookies.remove("wms_token");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;
        case 403:
          message = "您没有权限访问该资源 (403)";
          break;
        case 404:
          message = `请求地址不存在: ${error.config.url} (404)`;
          break;
        case 500:
          message = "服务器内部错误 (500)";
          break;
        case 502:
          message = "网关错误 (502)";
          break;
        default:
          message = data.message || `连接出错 (${status})`;
      }
    } else if (error.request) {
      // 请求发出了但没有收到响应 (比如断网、跨域被拦截、后端挂了)
      message = "服务器无响应，请检查后端服务是否启动";
    } else {
      // 发生了一些设置请求时引起的错误
      message = error.message;
    }

    // 使用 Semi Design 展示错误提示
    Toast.error({
      content: message,
      duration: 4,
      stack: true, // 开启堆叠，防止多个错误重叠看不清
    });

    return Promise.reject(error);
  }
);

export default request;
