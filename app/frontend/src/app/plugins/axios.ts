import axios from "axios";

const axios_instance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axios_instance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios_instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalConfig = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalConfig.retry
    ) {
      originalConfig.retry = true;

      // ログイン処理はリトライしない
      if (originalConfig.url === "api/users/login") {
        return Promise.reject(error);
      }

      try {
        await axios_instance.post("/api/users/retry", {});
        return axios_instance(originalConfig); // ← 元のリクエストを再送
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // それ以外のエラーはそのまま
  }
);

export default axios_instance;