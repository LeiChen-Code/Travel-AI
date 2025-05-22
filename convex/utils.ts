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