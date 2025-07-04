import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClerkProvider from "./providers/ConvexClerkProvider";

/* 设置字体为 Noto Sans SC */
const notoSansSC = localFont({
  src: [
    {
      path: "./fonts/NotoSansSC-Light.otf",
      weight: "300",
    },
    {
      path: "./fonts/NotoSansSC-Regular.otf",
      weight: "400",
    },
    {
      path: "./fonts/NotoSansSC-Medium.otf",
      weight: "500",
    },
    {
      path: "./fonts/NotoSansSC-Bold.otf",
      weight: "700",
    },
  ],
  variable: "--font-noto-sans-sc",
  display: "swap",
});


export const metadata: Metadata = {
  title: "智行派",
  description: "用 AI 帮助旅行规划",
  icons:{
    icon:'/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSC.variable} font-sans antialiased`}
      >
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
