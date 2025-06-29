"use client";
import { ChatMessage } from "@/components/chat/chat-message";
import TextareaAutosize from "react-textarea-autosize";
import { KeyboardEvent, useRef, useEffect, useState } from "react";
import { useConvexChat, ConvexChatProvider } from "@/components/chat/convex-chat-provider";
import { Message } from "ai";

// 定义整个聊天组件，包括对话区域和聊天输入框

// Wrapper component that includes the provider
export function Chat({ planId, isNewPlan }: { planId: string, isNewPlan:boolean }) {
  return (
    // 传入 planId 作为 chatId
    <ConvexChatProvider planId={planId} isNewPlan={isNewPlan}>
      <ChatInner />
    </ConvexChatProvider>
  );
}

// Inner component that uses the context
// 利用 useConvexChat hook 获取输入内容、消息列表、提交与清空操作等
function ChatInner() {
  const {
    input,
    handleInputChange,
    handleSubmit,
    handleClearChat,
    isLoading,
    isClearing,
    convexMessages,
  } = useConvexChat();  // 获取聊天上下文

  const messagesEndRef = useRef<HTMLDivElement>(null);  // 指向消息列表底部的引用
  const chatContainerRef = useRef<HTMLDivElement>(null);  // 指向整个聊天容器的引用
  const [initialLoad, setInitialLoad] = useState(true);  // 是否为当前聊天页面的初次加载

  // 将消息列表中的消息转换为适合 ChatMessage 组件渲染的标准格式
  const allMessages: Message[] = convexMessages
    .map((msg: any) => ({
      id: msg._id,
      // Ensure role is valid for Message type
      role:
        msg.role === "user" ||
        msg.role === "assistant" ||
        msg.role === "system" ||
        msg.role === "function" ||
        msg.role === "tool"
          ? msg.role
          : "assistant",
      content: msg.text || msg.content || "",
      createdAt: new Date(msg.createdAt || msg._creationTime),  // 统一时间戳为 Date 对象
      // Add parentId if it exists for threading
      // parentId: msg.parentId,
    }))
    .filter((msg: any) => msg.content.trim() !== "") // 过滤空消息
    .sort((a: any, b: any) => a.createdAt - b.createdAt);  // 根据创建时间升序排序，确保消息展示顺序正确

  useEffect(() => {
    // 消息列表变换时，输出调试信息
    console.log("Messages from Convex:", convexMessages);
    console.log("Processed messages for display:", allMessages);
  }, [convexMessages]);

  // 每次有新消息时自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // 初次加载，并不自动滚动到底部
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    // 非初次加载时，只要消息列表非空，自动滚动到底部
    if (allMessages.length > 0) {
      scrollToBottom();
    }
  }, [allMessages, initialLoad]);

  useEffect(() => {
    // 动态调整聊天容器的高度，以适应消息数量的变化
    if (chatContainerRef.current) {
      // 每条消息预留 100 像素的高度，整体高度不会小于 100 像素，也不会超过窗口高度的 60%
      const height = Math.min(window.innerHeight * 0.6, Math.max(100, allMessages.length * 100));
      chatContainerRef.current.style.height = `${height}px`;
    }
  }, [allMessages]);

  // 定义键盘响应事件
  // 当用户按下 enter 键，触发消息的提交，而不是换行
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // 判断输入内容去除空格后是否非空
      if (input.trim()) {
        handleSubmit(e as any);  // 调用提交消息函数
      }
    }
  };


  return (
    <div className={`w-full h-full flex flex-col items-center bg-[#FFFFFF]`}>

      {/* 消息展示区域 */}
      <div className="h-full flex-1 overflow-y-auto bg-white pl-4 pt-4">
        <div
          ref={chatContainerRef}
          className="w-full h-full pr-2 transition-all duration-300 ease-in-out">
          
          {/* 遍历所有消息，每条消息渲染一个 chatMessage 组件 */}
          {allMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message as Message}
              messages={allMessages as Message[]}
              isLoading={isLoading} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="w-full p-4 bg-gray-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {/* 聊天输入框 */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div
            className="w-full bg-white cursor-text"
            onClick={(e) => {
              const textarea = e.currentTarget.querySelector("textarea");
              if (textarea) textarea.focus();
            }}>
            <TextareaAutosize
              className="w-full border border-gray-1 rounded-lg resize-none px-4 py-3 text-base disabled:opacity-50
                        focus:outline-gray-2 transition-colors"
              placeholder="发送信息帮助行程规划..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              maxRows={3}
            />
          </div>
        </form>

        <div className="flex justify-between items-center">
          {/* 清空聊天按钮*/}
          <button
            onClick={handleClearChat}
            disabled={isLoading || isClearing || convexMessages.length === 0}  // 当聊天正在加载或正在清空或没有消息时，按钮不响应
            className="px-3 py-1.5 rounded-lg bg-white-1 border border-gray-1 text-sm shadow-sm flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {isClearing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在清空...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trash-2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
                清空聊天
              </>
            )}
          </button>

        </div>
        

      </div>

    </div>
  );
}