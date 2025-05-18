import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Import Id type if needed

// Define the structure of a single message argument, matching relevant fields
// 定义单条消息参数的校验器
const messageArgValidator = v.object({
  _id: v.id("messages"),
  content: v.optional(v.string()),
  text: v.optional(v.string()),
  role: v.string(),
  createdAt: v.optional(v.number()), // Original creation time
  userId: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  chatId: v.optional(v.string()),
  parentId: v.optional(v.string()),
  modelPreference: v.optional(v.string()),
  // Exclude fields not needed for history or generated during archive
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
      console.log("No messages provided to archive.");
      return null; // Nothing to do
    }

    // Generate a unique ID for this archive session
    // Using a simple timestamp + random number approach for simplicity here
    // Consider using a more robust UUID library if needed in production
    // 为本次归档操作生成唯一的归档 ID
    const archiveSessionId = `archive-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const archivedAt = Date.now();
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
          parentId: message.parentId,
          modelPreference: message.modelPreference,
          archiveSessionId: archiveSessionId,
          archivedAt: archivedAt,
        });
        // 收集成功归档的消息 ID，待归档完成后将他们从消息表删除
        originalMessageIdsToDelete.push(message._id);
      } catch (error) {
        // 归档过程中如果单条消息插入失败，会记录错误日志，但不会中断归档流程
        console.error(`Failed to archive message ${message._id}:`, error);
        // Decide on error handling: continue, throw, log?
        // For now, log and continue to archive others.
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
        // Log error and continue deleting others
      }
    }

    console.log(`Deleted ${deletedCount} original messages.`);

    return null;
  },
});