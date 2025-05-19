'use client';
import React, { useEffect, useState } from "react";
import axios from "./plugins/axios";

export default function Page() {
  const [text, setText] = useState("");

  useEffect(() => {
    axios.get("/api/users/test")
      .then((res) => {
        setText(res.data.message);
      })
      .catch((error) => {
        setText("データの取得に失敗しました");
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
            .then((res) => {
              window.location.href = "/login";
            })
            .catch((error) => {
              console.error("ログアウト失敗:", error);
            });
        }}
      >
        ログアウト
      </button>
    </div>
  );
}