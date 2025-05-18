"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useState } from "react";

// 定义单条聊天消息组件

// Define an extended type that includes the optional parentId from our Convex schema
// 标识该消息是否为回复
type ChatMessageData = Message & {
  parentId?: string;
};


export function ChatMessage({
  message, // 当前要渲染的消息
  messages,  // 同一会话下的所有消息数组
  ...props
}: {
  message: ChatMessageData;
  messages: ChatMessageData[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find parent message if this is a reply
  // 找到当前消息的父消息
  const parentMessage = messages.find((m) => m.id === message.parentId);

  // Check if this message has any replies
  // 查找所有回复当前消息的子消息数量
  const replies = messages.filter((m) => m.parentId === message.id);

  return (
    <div
      // 根据消息是否为 AI 回复 动态调整样式
      className={cn(
        "group relative flex items-start px-4 py-2",
        message.parentId && "ml-8",
      )}
      {...props}>
      <div
        className={cn(
          "max-w-4xl mx-auto flex w-full",
          message.parentId && "border-l-2 border-gray-100 pl-4"
        )}>
        <div className="flex-1 space-y-2 overflow-hidden">
          {parentMessage && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-1">
              Show parent message
            </button>
          )}

          {parentMessage && isExpanded && (
            <div className="mb-2 p-2 bg-gray-50 text-sm text-gray-600">
              <div className="prose max-w-none break-words prose-sm">
                <ReactMarkdown>
                  {parentMessage.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div
            className={cn(
              "inline-block rounded-chat",
              message.role === "user" ? "bg-[#F6F7F9] px-4 py-2" : ""
            )}>
            <div className="prosemal max-w-none break-words prose-p:leading-relaxed prose-pre:p-0 prose-headings:font-normal prose-strong:font-nor">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {replies.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}