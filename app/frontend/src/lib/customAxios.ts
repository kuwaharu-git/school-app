import axios, { AxiosInstance } from "axios";

function setupInterceptors(instance: AxiosInstance, redirectOn401: boolean) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalConfig.retry &&
        originalConfig.url !== "/api/users/retry"
      ) {
        originalConfig.retry = true;

        if (originalConfig.url === "api/users/login") {
          return Promise.reject(error);
        }

        try {
          await instance.post("/api/users/retry", {});
          return instance(originalConfig);
        } catch (refreshError) {
          if (redirectOn401) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

// インスタンス作成
const RedirectAxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

const noRedirectAxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// インターセプターを設定
setupInterceptors(RedirectAxiosInstance, true);
setupInterceptors(noRedirectAxiosInstance, false);

export { noRedirectAxiosInstance as noRedirectCustomAxios };
export { RedirectAxiosInstance as customAxios };