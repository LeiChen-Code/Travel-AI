import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// 初始化 Convex 数据库中的消息数据
// 当 messages 表为空时，向表中插入一条欢迎信息 "你好，这里是智行派"
export const setupInitialData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 检查 messages 表是否存在消息数据
    const existingMessages = await ctx.db.query("messages").collect();
    
    // 如果消息表为空
    if (existingMessages.length === 0) {
      console.log("Initializing database with sample data...");

      // 创建欢迎消息的 ID
      const chatId = "sample-chat-" + Date.now();

      // 向表中插入欢迎信息
      await ctx.db.insert("messages", {
        chatId,
        role: "assistant",
        text: "你好，这里是智行派！",
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