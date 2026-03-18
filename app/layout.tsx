"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import MonitorGlobal from "@/components/MonitorGlobal";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Verifica se a página atual é a de login
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const savedUser = localStorage.getItem("task_user"); 
    
    if (!savedUser && !isLoginPage) {
      router.push("/login");
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [pathname, isLoginPage, router]);

  return (
    <html lang="pt-br">
      <head>
        {/* Isso define o nome que aparece na aba do navegador */}
        <title>Task | Gerenciamento de Atividades</title>
        <meta name="description" content="Sistema de criação e monitoramento de atividades" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0F1A] text-gray-100`}>
        <MonitorGlobal />
        
        {/* Se for página de login, renderiza puro. Se não, renderiza com Header */}
        {isLoginPage ? (
          <div className="h-screen overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="flex flex-col h-screen overflow-hidden">
            <Header user={user || { nome: "Carregando...", matricula: "---" }} />
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}