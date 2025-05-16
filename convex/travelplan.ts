import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getUrl = mutation({
    args:{
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        // 根据存储文件的 ID 获取该文件的访问 URL
        // 允许前端安全地请求后端生成的文件访问链接
        return await ctx.storage.getUrl(args.storageId)
    }
})