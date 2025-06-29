"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import remarkGfm from 'remark-gfm'

// 定义单条聊天消息组件，用于界面展示

export function ChatMessage({
  message, // 当前要渲染的消息
  messages,  // 同一会话下的所有消息列表
  isLoading,
  ...props
}: {
  message: Message;
  messages: Message[];
  isLoading?: boolean;
}) {

  return (
    <div 
      className={cn(
        "group relative flex items-start px-4 py-2",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
      {...props}
    >

      {/* <div className="max-w-4xl mx-auto flex w-full"> */}
      <div className={cn(
        "max-w-4xl flex w-full",
        message.role === "user" ? "justify-end" : "justify-start"
      )}>
        <div className="flex-1 space-y-2 overflow-hidden flex flex-col">

          {/* 根据消息角色应用不同的背景色和样式。如果是用户消息，添加背景色 */}
          <div
            className={cn(
              "inline-block rounded-chat",
              message.role === "user" ? "bg-[#F6F7F9] px-4 py-2 rounded-br-none ml-auto" : "rounded-bl-none mr-auto"
            )}>

            {/* 将消息内容渲染为 markdown 格式 */}
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="prose max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 
              prose-headings:font-normal prose-strong:font-nor"> 
              {message.content}
            </ReactMarkdown>

          </div>

          {/* 加载中状态 */}
          {isLoading && (
            <div className="w-full flex justify-center py-4 text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}