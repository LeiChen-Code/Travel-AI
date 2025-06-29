import { v } from "convex/values";
import { mutation } from "./_generated/server";

// 初始化 Convex 数据库中的消息数据
// 如果当前会话的消息记录为空时，向表中插入一条欢迎信息 "你好，这里是智行派"
export const setupInitialData = mutation({
  args: {
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 检查 messages 表中对应的 chatId 会话是否存在消息数据
    const existingMessages = await ctx.db
                              .query("messages")
                              .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
                              .collect();
    
    // 如果消息表为空
    if (existingMessages.length === 0) {
      console.log("Initializing database with sample data...");

      // 向表中插入欢迎信息
      await ctx.db.insert("messages", {
        chatId: args.chatId,
        role: "assistant",
        text: "你好，这里是智行派！我将帮助您进行旅行规划！",
        createdAt: Date.now(),
        createdBy: "system",  // 欢迎消息由系统创建
        complete: true,
      });

      console.log("Sample data initialized successfully!");
    } else {
        // 数据库中已经存在消息
      console.log("Database already contains data, skipping initialization.");
    }
  },
});