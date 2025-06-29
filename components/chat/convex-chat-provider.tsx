"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useChat as useAIChat, UseChatHelpers } from "ai/react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { nanoid } from "nanoid";
import { Message } from "ai";
import { Id } from "@/convex/_generated/dataModel"; // Ensure Id type is imported if used in message types

// 封装聊天相关的状态（输入内容、消息列表、loading 状态等）以及处理函数（提交消息、清空聊天等）
// 并通过 React 的上下文（Context）向整个组件树提供访问

// 定义了上下文暴露给子组件的结构
type ConvexChatContextType = {
  input: string;  // 聊天输入
  setInput: UseChatHelpers["setInput"]; 
  handleInputChange: UseChatHelpers["handleInputChange"];
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;  // 聊天提交方法
  handleClearChat: () => Promise<void>; // 清空聊天方法
  chatId: string;  // 当前聊天 ID
  convexMessages: any[]; // 当前消息数组，管理要展示的消息
  isLoading: boolean;  // 加载状态
  isClearing: boolean; // Loading state for clear operation
};
// 创建上下文类型
const ConvexChatContext = createContext<ConvexChatContextType | null>(null);

export function ConvexChatProvider({ children }: { children: ReactNode }) {
  // 聊天 ID 初始化和本地存储持久化
  const [chatId, setChatId] = useState<string>(() => {
    // 判断当前环境是否为浏览器，只有浏览器环境下才能访问 localStorage
    // 保证即使用户刷新页面或重新进入应用，chatId 也能保持一致
    if (typeof window !== "undefined") {
      // !先尝试从 localStorage 读取之前保存的 currentChatId，如果存在直接使用
      const storedChatId = localStorage.getItem("currentChatId"); 
      return storedChatId || `chat-${nanoid()}`;  // 如果之前不存在 chatId，则使用 nanoid() 生成一个新的唯一 ID
    }
    return `chat-${nanoid()}`;
  });

  useEffect(() => {
    // 每当 chatId 变化时，触发 useEffect，更新 chatId
    if (typeof window !== "undefined") {
      localStorage.setItem("currentChatId", chatId);
    }
  }, [chatId]);

  const [isLoading, setIsLoading] = useState(false);   // 加载聊天的状态
  const [isClearing, setIsClearing] = useState(false); // 清空操作的状态

  const [input, setInput] = useState("");  // 聊天输入的状态
  // 响应输入框内容变化并实时更新 input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 从 convex 后端获取与当前聊天 ID 相关的消息列表
  const rawConvexMessages = useQuery(api.messages.listMessage, { chatId }) || [];
  
  // 本地用于实际渲染的消息数组，初始为空
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);

  // 同步 displayedMessages 和后端返回的 rawConvexMessages
  // 每当后端消息发生变化时，自动更新本地的 displayedMessages，确保界面展示的消息始终与后端数据保持一致
  useEffect(() => {
    setDisplayedMessages(rawConvexMessages);
  }, [rawConvexMessages]);

  
  // 从 convex API 获取创建消息接口
  const createMessage = useMutation(api.messages.createMessage);
  const archiveChatMutation = useMutation(api.messages.archiveChat); // 归档聊天接口

  // 表单提交的处理函数，override
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 用户提交消息后，先阻止表单的默认行为
    e.preventDefault();
    // 对输入内容去空格处理
    const currentInput = input.trim();
    if (!currentInput) return;  // 输入为空，直接返回

    setIsLoading(true);  // 设置加载状态
    let messageToSend = currentInput;  // 保存输入内容到 messageToSend
    console.log(`Submitting message: \"${messageToSend}\"`);  // 打印信息

    setInput("");  // 设置用户输入

    // 为提升用户体验，在本地消息列表中插入一个"乐观消息"，即带有临时 ID 的用户消息，让用户能立即看到自己的输入
    const optimisticUserMessage = {
      _id: `temp-${nanoid()}` as Id<"messages">, // Temporary ID
      chatId,
      role: "user",
      text: messageToSend,
      content: messageToSend, // Ensure content field exists for display component
      createdAt: Date.now(),
      complete: false, // Mark as temporary/optimistic
    };
    setDisplayedMessages((prev) => [...prev, optimisticUserMessage]);  // 插入乐观消息到本地消息列表

    try {

      // 1.调用 createMessage 将用户输入的消息保存到 convex 后端
      const createdMessage = await createMessage({
        chatId,
        role: "user",
        text: messageToSend,
        complete: true,
      });

      // 保存后端成功后用真实的消息 ID 替换本地的临时消息
      setDisplayedMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticUserMessage._id
            ? { ...msg, _id: createdMessage, complete: true }
            : msg
        )
      );

      // !实现前端与 AI 聊天后端的消息交互
      // 2.通过 fetch 请求 /api/chat 路由，将当前消息和聊天 ID 发送给后端，触发 AI 聊天处理
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: messageToSend }], // Pass only the current message
          chatId,
        }),
      });

      // 如果后端返回错误，将刚才插入的乐观消息从本地消息列表中移除
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from /api/chat:", errorData);
        // 移除返回出错的乐观消息
        setDisplayedMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
      }
    } catch (error) {
      // 打印错误信息
      console.error("Error calling /api/chat:", error);
      // 移除返回出错的乐观消息
      setDisplayedMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
    } finally {
      // 设置加载状态
      setIsLoading(false);
    }
  };

  // 清空聊天函数
  const handleClearChat = async () => {
    // 先检查当前是否有消息需要清空或者清空操作是否正在进行中
    if (displayedMessages.length === 0 || isClearing) {
      return; // 如果没有消息或正在清空，直接返回
    }

    // 进入清空流程
    console.log("Attempting to archive and clear chat...");
    setIsClearing(true);

    try {
      
      // 将当前消息列表映射为后端归档需要的格式
      const messagesToArchive = displayedMessages
        .map((msg) => ({
          _id: msg._id, // Assuming _id is always present and is Id<"messages"> or temp ID
          content: msg.content,
          text: msg.text,
          role: msg.role,
          createdAt: msg.createdAt || msg._creationTime, // Use correct timestamp field
          userId: msg.userId,
          createdBy: msg.createdBy,
          chatId: msg.chatId,
          parentId: msg.parentId,
          // modelPreference: msg.modelPreference,
        }))
        .filter((msg) => !msg._id.startsWith("temp-")); // 过滤掉 temp- 开头的临时消息
      
      // 如果有需要归档的消息，调用归档操作
      if (messagesToArchive.length > 0) {
        await archiveChatMutation({ messagesToArchive });
        console.log("Chat archived successfully.");
      }

      // 归档成功后，清空本地消息列表
      setDisplayedMessages([]);
      console.log("Displayed messages cleared locally.");
    } catch (error) {
      // 打印错误信息
      console.error("Failed to archive chat:", error);
    } finally {
      // 设置清空状态
      setIsClearing(false);
    }
  };

  // 将聊天状态和方法组合成一个 ConvexChatContextType 类型的对象
  const contextValue: ConvexChatContextType = {
    input,  // 输入框内容
    setInput,  // 更新输入框内容的函数
    handleInputChange,  // 响应输入框内容变化的事件处理函数
    handleSubmit,  // 处理提交消息的函数
    handleClearChat, // 清空聊天的函数
    chatId,
    convexMessages: displayedMessages, // 用于界面展示的消息数组
    isLoading: isLoading || isClearing, // Combine loading states
    isClearing, // 清空状态
  };

  return <ConvexChatContext.Provider value={contextValue}>{children}</ConvexChatContext.Provider>;
}

export function useConvexChat() {
  // 访问聊天上下文提供的状态和方法
  const context = useContext(ConvexChatContext);
  // 如果没有被 ConvexChatProvider 包裹，返回值会是 null
  if (!context) {
    throw new Error("useConvexChat must be used within a ConvexChatProvider");
  }
  return context;  // 返回上下文对象
}