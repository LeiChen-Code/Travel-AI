import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    planDetails:defineTable({
        isGeneratedUsingAI: v.boolean(),
        // ? Id<"_storage"> 是 Convex 中用于引用存储在 Convex 存储系统中的文件的标识符类型
        storageId: v.union(v.id("_storage"), v.null()),  // ! storage 指什么
        // nameoftheplace: v.string(),  // 旅游地点
        userPrompt: v.string(),  // prompt
        abouttheplace: v.string(),  // 旅游地点介绍
        activitiestodo: v.array(v.string()),  // 活动列表
        topplacestovisit: v.array(
            v.object({
                name: v.string(),  // 名称
                coordinates: v.object({  // 经纬度坐标
                    lat: v.float64(),
                    lng: v.float64(),
                }),
            })
        ),  // 热门景点推荐
        packingchecklist: v.array(v.string()),  // 旅行物品清单
        localfood: v.array(v.string()),  // 美食推荐
        userId: v.id("users"),  // 用户ID，连接用户表
        besttimetovisit: v.string(),  // 最佳旅行时间
        itinerary: v.array(  // 行程表
            v.object({
                title: v.string(), 
                activities: v.object({
                    morning: v.array(
                        v.object({
                        itineraryItem: v.string(),
                        briefDescription: v.string(),
                        })
                    ),
                    afternoon: v.array(
                        v.object({
                        itineraryItem: v.string(),
                        briefDescription: v.string(),
                        })
                    ),
                    evening: v.array(
                        v.object({
                        itineraryItem: v.string(),
                        briefDescription: v.string(),
                        })
                    ),
                }),
            })
        ),
        contentGenerationState: v.object({
            imagination: v.boolean(),
            abouttheplace: v.boolean(),
            activitiestodo: v.boolean(),
            topplacestovisit: v.boolean(),
            itinerary: v.boolean(),
            localfood: v.boolean(),
            packingchecklist: v.boolean(),
            besttimetovisit: v.boolean(),
        }),
    }).index("by_userId", ["userId"]),

    users: defineTable({  // 用户表
        userId: v.string(),
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        imageUrl:v.string(),  // 用户头像
        //credits: v.number(),
        //freeCredits: v.number(),
    })
    .index("by_clerk_id", ["userId"])
    .index("by_email", ["email"]),
    
    planSettings: defineTable({  // 行程设置的表单
        userId: v.id("users"),  // 关联用户表
        planId: v.optional(v.id("planDetails")),  // 关联行程表，初始时还没有
        planTitle:v.string(),  // 行程标题
        travelPlace: v.string(),  // 旅游地点
        budget: v.optional(v.number()),  // 预算
        travelType: v.union(v.string(), v.null()),  // 旅行风格选择(紧凑、适中、休闲)
        fromDate: v.number(),  // 行程开始日期
        toDate: v.number(),  // 行程结束日期
        travelPersons: v.optional(v.number()),  // 同行人数
        imageURL: v.string(),  // 封面，必须有
        imageStorageId: v.id("_storage"),
    })
    .searchIndex("by_planTitle", {searchField: 'planTitle'})
    .searchIndex("by_place", {searchField: 'travelPlace'}),
})