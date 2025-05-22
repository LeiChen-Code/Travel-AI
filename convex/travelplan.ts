import { ConvexError, v } from "convex/values";
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

// 创建行程
export const createPlan = mutation({
    args: {
        planTitle:v.string(),
        travelPlace: v.string(),
        fromDate: v.number(), // 时间戳
        toDate: v.number(),   // 同上
        travelPersons: v.number(),
        travelType: v.union(v.string(), v.null()),
        budget: v.number(),
        imageURL: v.string(),
        imageStorageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        // 获取用户身份，知道是谁在创建行程
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new ConvexError('用户未经验证')
        }
        
        // 查询用户表 "users"，匹配电子邮件验证身份
        const user = await ctx.db.query('users').filter((q) => q.eq(q.field('email'), identity.email)).collect();

        if(user.length === 0){
            throw new ConvexError('用户不存在')
        }
        // 验证用户存在以后，将用户新创建的行程信息插入行程设置表 "planSettings"
        const plan = await ctx.db.insert('planSettings',{
            ...args,
            userId: user[0]._id,
            planTitle: args.planTitle,
            travelPlace: args.travelPlace,
            budget: args.budget,
            travelType: args.travelType,
            fromDate: args.fromDate,
            toDate: args.toDate,
            travelPersons: args.travelPersons,
            imageURL: args.imageURL,
            imageStorageId: args.imageStorageId,
        })

        return plan;
    }
})

export const getHistoryPlan = query({
    handler: async(ctx) => {
        // 获取当前登录用户身份
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("用户未登录");
        }

        // 查询用户表，获取对应的用户记录（以邮箱为主键）
        const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), identity.email))
        .collect();

        if (user.length === 0) {
            throw new ConvexError("用户不存在");
        }

        const userId = user[0]._id;

        // 查询该用户所有历史行程（按出发日期 fromDate 倒序返回）
        const plans = await ctx.db
        .query("planSettings")
        .filter((q) => q.eq(q.field("userId"), userId))
        .order("desc") // 默认根据 _creationTime 排序（或你也可以 .order("desc", "fromDate")）
        .collect();

        // 打印日志
        console.log(`Get History Plans by ${userId}`)

        return plans;
    }
})



