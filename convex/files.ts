import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {
  },
  handler: async (ctx, args) => {
    // 生成上传 URL，该 URL 通常用于前端文件直接上传到云存储，而不需要经过服务器中转
    return await ctx.storage.generateUploadUrl();
  },
});