import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// 将 AI 回复的消息直接保存到数据库
export const saveAIResponse = internalMutation({
  args: {
    chatId: v.string(),  // 聊天会话 ID
    role: v.string(),  // 消息角色
    text: v.string(),  // 文本内容
    content: v.optional(v.string()),  
    complete: v.optional(v.boolean()), // 消息是否完成
    modelPreference: v.optional(v.string()),  // 模型偏好
  },
  handler: async (ctx, args) => {
    console.log("Saving AI response to database:", args);

    // 将消息插入数据库的 messages 表
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      text: args.text,
      content: args.content,
      complete: args.complete !== undefined ? args.complete : true,
      createdAt: Date.now(),
      // modelPreference: args.modelPreference,
    });

    console.log("AI response saved with ID:", messageId);
    return messageId;
  },
});