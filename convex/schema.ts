import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    planDetails:defineTable({
        isGeneratedUsingAI: v.boolean(),
        userPrompt: v.string(),  // prompt
        abouttheplace: v.string(),  // 旅游地点介绍
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
                        place: v.object({  // 每个活动都要包括一个具体的地点
                            name: v.string(),
                            coordinates: v.object({
                                lat: v.float64(),
                                lng: v.float64(),
                            }),
                        }),
                        briefDescription: v.string(),
                        })
                    ),
                    afternoon: v.array(
                        v.object({
                        itineraryItem: v.string(),
                        place: v.object({
                            name: v.string(),
                            coordinates: v.object({
                                lat: v.float64(),
                                lng: v.float64(),
                            }),
                        }),
                        briefDescription: v.string(),
                        })
                    ),
                    evening: v.array(
                        v.object({
                        itineraryItem: v.string(),
                        place: v.object({
                            name: v.string(),
                            coordinates: v.object({
                                lat: v.float64(),
                                lng: v.float64(),
                            }),
                        }),
                        briefDescription: v.string(),
                        })
                    ),
                }),
            })
        ),
        contentGenerationState: v.object({
            //imagination: v.boolean(),
            abouttheplace: v.boolean(),
            itinerary: v.boolean(),
            localfood: v.boolean(),
            packingchecklist: v.boolean(),
            besttimetovisit: v.boolean(),
        }),
    })
    .index("by_userId", ["userId"]),

    users: defineTable({  // 用户表
        clerkId: v.string(),
        email: v.string(),
        userName: v.optional(v.string()),
        imageUrl:v.string(),  // 用户头像
    })
    .index("by_user_id", ["clerkId"])
    .index("by_email", ["email"]),
    
    planSettings: defineTable({  // 行程设置的表单
        userId: v.id("users"),  // 关联用户表
        planId: v.optional(v.id("planDetails")),  // 关联行程表，初始时还没有
        planTitle:v.string(),  // 行程标题
        travelPlace: v.string(),  // 旅游地点
        budget: v.optional(v.number()),  // 预算
        travelType: v.optional(v.string()),  // 旅行风格选择(紧凑、适中、休闲)
        fromDate: v.number(),  // 行程开始日期
        toDate: v.number(),  // 行程结束日期
        travelPersons: v.optional(v.number()),  // 同行人数
        imageURL: v.string(),  // 封面，必须有
        imageStorageId: v.id("_storage"),
    })
    .searchIndex("by_planTitle", {searchField: 'planTitle'})
    .searchIndex("by_place", {searchField: 'travelPlace'})
    .searchIndex("by_planId", {searchField: 'planId'}),

    // messages 聊天消息表，存储实时聊天消息，处理高频实时操作
    messages: defineTable({
        content: v.optional(v.string()),  // 消息内容
        text: v.optional(v.string()),
        role: v.string(),  // 角色，即模型还是用户
        createdAt: v.optional(v.number()),  // 创建聊天的时间
        userId: v.optional(v.string()),  // 用户 ID
        createdBy: v.optional(v.string()),  // 创建者??
        chatId: v.optional(v.string()),  // 所属聊天会话 ID
        complete: v.optional(v.boolean()),  // 标记该聊天消息是否完成
        parentId: v.optional(v.string()),  // 父消息 ID，即上一条消息 ID
        modelPreference: v.optional(v.string()),  // 模型偏好
    })
    .index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_chat", ["chatId"]),

    // modelPreferences 记录每个聊天会话的模型偏好设置
    modelPreferences: defineTable({
        chatId: v.string(),  // 聊天 ID
        model: v.string(),  // 模型名称
        lastUpdated: v.number(),  // 最后更新时间
    }).index("by_chat_id", ["chatId"]),

    // 历史消息表，便于后续检索和数据管理，存储低频访问的归档数据，避免主表膨胀
    chat_history: defineTable({
        // Fields copied from the original message
        originalMessageId: v.id("messages"), // 引用原始消息 ID，便于追溯
        content: v.optional(v.string()),
        text: v.optional(v.string()),
        role: v.string(),
        originalCreatedAt: v.optional(v.number()), // 原始消息的创建时间
        userId: v.optional(v.string()),
        createdBy: v.optional(v.string()),
        chatId: v.optional(v.string()),
        parentId: v.optional(v.string()),
        modelPreference: v.optional(v.string()),
        // Archiving specific fields
        archiveSessionId: v.string(), // 标记同一次归档操作的所有消息，用于批量管理
        archivedAt: v.number(), // 归档的时间戳
    }).index("by_archive_session", ["archiveSessionId"]),

})