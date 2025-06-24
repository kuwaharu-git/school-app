'use client';
import React, { ReactNode, useEffect, useState } from "react";
import { noRedirectCustomAxios } from "@/lib/customAxios";
import { AxiosResponse, AxiosError } from "axios";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AppList } from "./components/AppList";


export default function Home() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        noRedirectCustomAxios.get("/api/users/test")
            .then((res: AxiosResponse) => {
                setUsername(res.data.username);
            })
            .catch((error: AxiosError) => {
                if (error.response?.status !== 401) {
                    console.error("APIリクエスト失敗:", error);
                    // ログインページに移動
                    window.location.href = "/login";

                }
            });
    }, []);

    return (
        <>
            <Header username={username} />
            <main className="container max-w-none flex flex-col items-center min-h-screen mt-8">
                <AppList />
            </main>
            <Footer />
        </>
    );
}