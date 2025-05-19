'use client';
import React, { useEffect, useState } from "react";
import axios from "./plugins/customAxios";
import { AxiosResponse, AxiosError } from "axios";

export default function Page() {
  const [text, setText] = useState("");

  useEffect(() => {
    axios.get("/api/users/test")
      .then((res: AxiosResponse) => {
        setText(res.data.message);
      })
      .catch((error: AxiosError) => {
        setText("データの取得に失敗しました");
        console.error("データの取得に失敗:", error);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Hello, Next.js!</h1>
      <p>{text}</p>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => {
          axios
            .post("/api/users/logout")
            .then(() => {
              window.location.href = "/login";
            })
            .catch((error: AxiosError) => {
              console.error("ログアウト失敗:", error);
            });
        }}
      >
        ログアウト
      </button>
    </div>
  );
}