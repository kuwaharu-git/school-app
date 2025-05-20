'use client';
import React, { useEffect, useState } from "react";
import { noRedirectCustomAxios } from "./plugins/customAxios";
import { AxiosResponse, AxiosError } from "axios";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function Page() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    noRedirectCustomAxios.get("/api/users/test")
      .then((res: AxiosResponse) => {
        setUsername(res.data.username);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status !== 401) {
          console.error("APIリクエスト失敗:", error);
        }
      });
  }, []);

  return (
    <>
      <Header username={username} />
      <main className="container max-w-none flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Welcome to the Student Portal System</h1>
        <p className="mt-4 text-lg">This is a sample application.</p>
      </main>
      <Footer />
    </>
  );
}