"use client";
import { ChatMessage } from "@/components/chat/chat-message";
import TextareaAutosize from "react-textarea-autosize";
import { KeyboardEvent, useRef, useEffect, useState } from "react";
import { useConvexChat, ConvexChatProvider } from "@/components/chat/convex-chat-provider";
import { Message } from "ai";


// Wrapper component that includes the provider
export function Chat() {
  return (
    <ConvexChatProvider>
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
  } = useConvexChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);  // 是否为初次加载

  // Convert Convex messages to AI Message format for ChatMessage component
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
      createdAt: new Date(msg.createdAt || msg._creationTime),
      // Add parentId if it exists for threading
      parentId: msg.parentId,
    }))
    .filter((msg: any) => msg.content.trim() !== "") // Filter out empty messages
    .sort((a: any, b: any) => a.createdAt - b.createdAt);

  useEffect(() => {
    console.log("Messages from Convex:", convexMessages);
    console.log("Processed messages for display:", allMessages);
  }, [convexMessages]);

  // 每次消息变化时自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Skip auto-scrolling on initial page load
    // 初次加载，并不自动滚动
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    // Only scroll on subsequent message changes
    if (allMessages.length > 0) {
      scrollToBottom();
    }
  }, [allMessages, initialLoad]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const height = Math.min(window.innerHeight * 0.6, Math.max(100, allMessages.length * 100));
      chatContainerRef.current.style.height = `${height}px`;
    }
  }, [allMessages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(e as any);
      }
    }
  };


  return (
    <div className={`w-full h-full flex flex-col items-center bg-[#FFFFFF]`}>

      {/* 对话框 */}
      <div className="h-full flex-1 overflow-y-auto bg-white pl-4 pt-4">
        <div
          ref={chatContainerRef}
          className="w-full h-full pr-2 transition-all duration-300 ease-in-out">
          {allMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message as Message}
              messages={allMessages as Message[]}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

      </div>
      
      <div className="w-full p-4 bg-gray-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {/* 输入框 */}
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
            disabled={isLoading || isClearing || convexMessages.length === 0}
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