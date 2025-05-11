import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

// 创建用户
export const createUser = internalMutation({
    args:{
        userId: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
    }, handler: async(ctx, args) => {
        // 第一个参数是表格，第二个参数传入内容
        await ctx.db.insert("users", {
            userId: args.userId,
            email: args.email,
            imageUrl: args.imageUrl,
            firstName: args.firstName,
            lastName: args.lastName,
        })
    }
})

// 更新用户信息
export const updateUser = internalMutation({
    args: {
        userId: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
    },
    async handler(ctx, args) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .unique();
  
      if (!user) {
        throw new ConvexError("User not found");
      }
  
      await ctx.db.patch(user._id, {
        imageUrl: args.imageUrl,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName
      });
    },
});

// 删除用户
export const deleteUser = internalMutation({
    args: { userId: v.string() },
    async handler(ctx, args) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .unique();
  
      if (!user) {
        throw new ConvexError("User not found");
      }
  
      await ctx.db.delete(user._id);
    },
});

