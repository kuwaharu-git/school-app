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
    // ここでAPIレスポンスにis_initial_passwordが含まれていたらリダイレクト
    if (
      response.data &&
      typeof response.data.is_initial_password !== "undefined" &&
      response.data.is_initial_password === true &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/change-password"
    ) {
      window.location.href = "/change-password";
      return Promise.reject(new Error("初期パスワードのためリダイレクト"));
    }
    return response;
  },
  function (error) {
    const originalConfig = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalConfig.retry
    ) {
    // 認証エラーの場合は、リフレッシュトークンを使ってリトライ
    originalConfig.retry = true;
    // 以下の場合はリトライしない
    // ログイン処理とユーザ作成申請処理
    if (originalConfig.url === "api/users/login" || originalConfig.url === "api/users/request_user") {
      return Promise.reject(error);
    }
    return axios_instance
      .post("/api/users/retry", { refresh: "" })
      .then((response) => {
        return axios_instance(originalConfig);
      })
      .catch(function (error) {
        return Promise.reject(error);
      });
    } else if (error.response && error.response.status !== 422) {
      // 認証エラーまたは業務エラー以外の場合は、適切な画面に遷移
      window.location.href = "/login";
    } else {
      return Promise.reject(error);
    }
  }
);

export default axios_instance;