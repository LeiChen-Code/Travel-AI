import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

import { ConvexError, v } from "convex/values";

import { generatebatch1, generatebatch2, generatebatch3 } from "@/lib/openai";
import { getIdentityOrThrow } from "./utils";

// 判断用户是否是该行程的管理者
export const PlanAdmin = query({
  args: { planId: v.string() },
  handler: async (ctx, args) => {
    return getPlanAdmin(ctx, args.planId);
  },
});
// 校验行程和用户
export const getPlanAdmin = async (ctx: QueryCtx, planId: string) => {
    // 用户身份验证
    const identity = await getIdentityOrThrow(ctx);
    if (!identity) {
        return { isPlanAdmin: false, planName: "" };
    }

    const { subject } = identity;  // 返回用户 ID

    // 查询行程设置表 planSettings 校验是否存在行程
    const plan = await ctx.db
    .query("planSettings")
    .filter((q) => q.eq(q.field("planId"), planId))
    .collect();

    if (plan && plan[0].userId === subject) // 行程存在且用户校验通过，返回 true
        return { isPlanAdmin: true, planName: plan[0].travelPlace };
    return { isPlanAdmin: false, planName: "" };
};
