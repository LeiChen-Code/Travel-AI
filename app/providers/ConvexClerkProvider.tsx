"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { zhCN } from '@clerk/localizations'

// 一个 React 组件
// 用于将 Clerk 和 Convex 的提供者（Provider）包装在一起，为子组件提供身份验证和状态管理的功能。

// 修改 convex url
// ConvexReactClient 用于和 Convex 后端通信
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

const ConvexClerkProvider = ({children}: {children: ReactNode}) => (
  // 修改 clerk key
  // ClerkProvider 用于处理用户身份验证
  // publishableKey 是 Clerk 提供的公钥，用于识别应用程序，即告诉 Clerk 哪个应用程序正在使用服务

  <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
  appearance={{   // appearance 用于自定义 Clerk 的外观
    layout: { // layout 用于设置社交按钮的样式和 logo 的 URL
      socialButtonsVariant: "iconButton",
      logoImageUrl: "/icons/logo.svg"  // 指定登录页面的 logo 图标
    },
    variables:{ // variables 用于设置颜色等样式
      colorBackground: "white",
      colorPrimary: "blue",
      colorText: "black",
      colorInputBackground: "white",
      colorInputText: "black",
      fontFamily: "var(--font-noto-sans-sc), sans-serif",
      fontSize: "0.9rem",
    }
  }}
  afterSignOutUrl="/"  // 定义用户退出登录后跳转到的路径
  localization={zhCN}
  >
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  </ClerkProvider>
);

export default ConvexClerkProvider;