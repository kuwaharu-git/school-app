'use client';
import React, { useEffect, useState } from "react";
import axios from "./plugins/axios";

export default function Page() {
  const [text, setText] = useState("");

  useEffect(() => {
    axios("/api/users/test")
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
    </div>
  );
}