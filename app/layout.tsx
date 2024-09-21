"use client";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

//sidebar

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSideBarOpen] = useState(false);
  const [totalEarning, setTotalEarning] = useState(0);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* header */}
          <Header onMenuClick={()=>setSideBarOpen(!sidebarOpen)} totalEarnings={totalEarning}/>
          <div className="flex flex-1 ">
            {/*sidebar*/}
            <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-100">
              {children}
            </main>
          </div>
        </div>
        <Toaster/>
      </body>
    </html>
  );
}
