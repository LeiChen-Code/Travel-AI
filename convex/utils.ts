import { ConvexError } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

// 用户身份校验
export const getIdentityOrThrow = async (
  ctx: ActionCtx | QueryCtx | MutationCtx
) => {
  // 获取用户身份
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("用户未登录");
  }
  return identity;
};

export const validateUser = async (
  ctx: QueryCtx | MutationCtx
) => {
  // 获取用户身份
  const identity = await getIdentityOrThrow(ctx);

  // 查询用户表，获取对应的用户记录（以邮箱为主键）
  const user = await ctx.db
  .query("users")
  .filter((q) => q.eq(q.field("email"), identity.email))
  .collect();

  if (user.length === 0) {
      throw new ConvexError("用户不存在");
  }

  return user[0]._id; // 获取用户 Id 返回
};
