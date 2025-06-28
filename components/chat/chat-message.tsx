"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import remarkGfm from 'remark-gfm'

// 定义单条聊天消息组件，用于界面展示

export function ChatMessage({
  message, // 当前要渲染的消息
  messages,  // 同一会话下的所有消息数组
  ...props
}: {
  message: Message;
  messages: Message[];
}) {

  return (
    <div
      // 根据消息是否为 AI 回复 动态调整样式
      className={cn(
        "group relative flex items-start px-4 py-2"
      )}
      {...props}
    >

      <div className="max-w-4xl mx-auto flex w-full">

        <div className="flex-1 space-y-2 overflow-hidden">

          {/* 根据消息角色应用不同的背景色和样式。如果是用户消息，添加背景色 */}
          <div
            className={cn(
              "inline-block rounded-chat",
              message.role === "user" ? "bg-[#F6F7F9] px-4 py-2" : ""
            )}>
            {/* 将消息内容渲染为 markdown 格式 */}
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              className="prosemal max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 
              prose-headings:font-normal prose-strong:font-nor">
              {message.content}
            </ReactMarkdown>
            
          </div>

        </div>
      </div>
    </div>
  );
}