import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

// 创建用户
export const createUser = internalMutation({
    args:{
        clerkId: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        userName: v.optional(v.string()),
    }, handler: async(ctx, args) => {
        try{
            // 第一个参数是表格，第二个参数传入内容
          await ctx.db.insert("users", {
              clerkId: args.clerkId,
              email: args.email,
              imageUrl: args.imageUrl,
              userName: args.userName,
          })
          console.log(`User record created successfully: ${args.email}`);
        } catch(error){
            console.error("Error creating user record:", error);
            throw new ConvexError("创建用户失败");
        }
        
    }
})

// 更新用户信息
export const updateUser = internalMutation({
    args: {
        clerkId: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        userName: v.optional(v.string()),
    },
    async handler(ctx, args) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .unique();
  
      if (!user) {
        throw new ConvexError("User not found");
      }
  
      await ctx.db.patch(user._id, {
        imageUrl: args.imageUrl,
        email: args.email,
        userName: args.userName,
      });
    },
});

// 删除用户
export const deleteUser = internalMutation({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .unique();
  
      if (!user) {
        throw new ConvexError("User not found");
      }
  
      await ctx.db.delete(user._id);
    },
});

