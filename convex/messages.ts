import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel"; 


// messages.ts 主要实现 存储用户消息、存储AI消息、读取消息、归档消息的功能

// 存储用户创建的消息到数据库
export const createMessage = mutation({
  args: {
    content: v.optional(v.string()),
    text: v.optional(v.string()),
    role: v.string(),
    userId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    chatId: v.optional(v.string()),
    complete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      text: args.text,
      role: args.role,
      userId: args.userId,
      createdBy: args.createdBy,
      chatId: args.chatId,
      complete: args.complete,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// 从数据库读取消息
// ! 改为，根据用户筛选后进而再根据用户的会话筛选，一个用户可以有多个对话？
// ! 要记录对话属于哪个 planId？
export const listMessage = query({
  args: {
    userId: v.optional(v.string()),
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Determine the base query based on arguments
    let finalQuery;
    if (args.userId) {
        // 根据用户 ID 查找消息表
      finalQuery = ctx.db
        .query("messages")
        .withIndex("by_user", (q) => q.eq("userId", args.userId));
    } else if (args.chatId) {
        // 根据会话 ID 查找消息表
      finalQuery = ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId));
    } else {
      // 如果用户 ID 和会话 ID 都没有，直接查询整个消息表
      finalQuery = ctx.db.query("messages");
    }

    // 查询结果会按消息创建时间升序排序，并通过 collect() 方法返回所有匹配的消息。
    return await finalQuery.order("asc").collect();
  },
});


// 将 AI 回复的消息直接保存到数据库
export const saveAIResponse = internalMutation({
  args: {
    chatId: v.string(),  // 聊天会话 ID
    role: v.string(),  // 消息角色
    text: v.string(),  // 文本内容
    content: v.optional(v.string()),  
    complete: v.optional(v.boolean()), // 标记是否为乐观消息
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
    });

    console.log("AI response saved with ID:", messageId);
    return messageId;  // 返回消息 Id
  },
});

// 定义单条消息参数的校验器，用于对消息对象的数据结构进行类型和必填性检查
const messageArgValidator = v.object({
  _id: v.id("messages"),
  content: v.optional(v.string()),
  text: v.optional(v.string()),
  role: v.string(),
  createdAt: v.optional(v.number()), // Original creation time
  userId: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  chatId: v.optional(v.string()),
  // 归档时不需要校验状态 complete
  // complete: v.optional(v.boolean()), // Assuming 'complete' is stateful and not archived
});

// 归档聊天消息，将一批消息从主消息表迁移到历史归档表
export const archiveChat = mutation({
  args: {
    messagesToArchive: v.array(messageArgValidator),  // 传入消息数组
  },
  returns: v.null(),
  handler: async (ctx, args) => {

    if (args.messagesToArchive.length === 0) {
      console.log("No messages provided to archive. 没有消息需要归档");
      return null; // Nothing to do
    }


    // 为本次归档操作生成唯一的归档 ID，格式为当前时间戳 + 随机字符串
    const archiveSessionId = `archive-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const archivedAt = Date.now();  // 记录归档时间
    const originalMessageIdsToDelete: Id<"messages">[] = [];   // 记录待删除的消息 ID 列表

    // 将每条要归档的消息插入历史记录表
    for (const message of args.messagesToArchive) {
      try {
        await ctx.db.insert("chat_history", {
          originalMessageId: message._id,
          content: message.content,
          text: message.text,
          role: message.role,
          originalCreatedAt: message.createdAt,
          userId: message.userId,
          createdBy: message.createdBy,
          chatId: message.chatId,
          archiveSessionId: archiveSessionId,
          archivedAt: archivedAt,
        });
        // 收集成功归档的消息 ID，待归档完成后将他们从消息表删除
        originalMessageIdsToDelete.push(message._id);
      } catch (error) {
        // 归档过程中如果单条消息插入失败，会记录错误日志，但不会中断归档流程
        console.error(`Failed to archive message ${message._id}:`, error);
      }
    }

    console.log(
      `Archived ${originalMessageIdsToDelete.length} messages with session ID: ${archiveSessionId}`
    );

    // 归档完成后，从消息表中删除原始消息
    let deletedCount = 0;  // 记录删除成功的消息数量
    for (const messageId of originalMessageIdsToDelete) {
      try {
        await ctx.db.delete(messageId);  // 删除消息
        deletedCount++;
      } catch (error) {
        // 删除失败同样只记录日志，不会中断后续的删除
        console.error(`Failed to delete original message ${messageId}:`, error);
      }
    }

    console.log(`Deleted ${deletedCount} original messages.`);

    return null;
  },
});