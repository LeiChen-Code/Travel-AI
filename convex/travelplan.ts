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
import { getIdentityOrThrow, validateUser } from "./utils";
import { Doc, Id } from "./_generated/dataModel";
import { useId } from "react";
import { internal } from "./_generated/api";
import { generatebatch1, generatebatch2, generatebatch3 } from "@/lib/openai";


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
    .first();

    if (plan && plan.userId === subject) // 行程存在且用户校验通过，返回 true
        return { isPlanAdmin: true, planName: plan.travelPlace };
    return { isPlanAdmin: false, planName: "" };
};


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

// 获取行程设置 + 详细记录
export const getSinglePlan = query({
  args: {
    id: v.id("planDetails")
  },
  handler: async (ctx, args) => {
    // 校验用户身份，知道是谁在创建行程
    const userId = await validateUser(ctx); 
    // 读取详细记录
    const plan = await ctx.db.get(args.id); 
    // 行程不能为空
    if (!plan) {
      throw new ConvexError("Plan not found");
    }
    // 读取行程设置
    const planData = await ctx.runQuery(
      internal.travelplan.getPlanSettings, {
          planId: args.id,
      }) as Doc<"planSettings">;

    console.log(
      `getSinglePlan called by ${userId} for planId: ${args.id}`
    );

    return {
        ...plan,
        travelType: planData?.travelType ?? "",
        fromDate: planData?.fromDate,
        toDate: planData?.toDate,
        travelPersons: planData?.travelPersons,
        // budget:planData?.budget,
    };
  },
});

// 创建行程，填充 planSettings 表，初始化 planDetails 表
export const createPlan = mutation({
    args: {
        planTitle:v.string(),
        travelPlace: v.string(),
        fromDate: v.number(), // 时间戳
        toDate: v.number(),   // 同上
        noOfDays: v.string(),  // 旅行天数
        travelPersons: v.number(),
        travelType: v.optional(v.string()),
        budget: v.number(),
        imageURL: v.string(),
        imageStorageId: v.id("_storage"),
        isGeneratedUsingAI: v.boolean(),  // 是否已 AI 生成
    },
    handler: async (ctx, args) => {
        // 校验用户身份，知道是谁在创建行程
        const userId = await validateUser(ctx);  // 获取用户 Id

        // 验证用户存在以后
        const state = !args.isGeneratedUsingAI; // 修改 AI 生成状态
        
        // newPlan 相当于 planId
        const newPlan = await ctx.db.insert("planDetails",{
            userPrompt: `${args.noOfDays} days trip to ${args.travelPlace}`,  // 初始化 prompt
            abouttheplace:"",
            packingchecklist: [],
            localfood: [],
            besttimetovisit: "",
            itinerary: [],
            isGeneratedUsingAI: args.isGeneratedUsingAI,
            contentGenerationState:{
                imagination: state,
                abouttheplace: state,
                besttimetovisit: state,
                itinerary: state,
                localfood: state,
                packingchecklist: state,
            },
            userId: userId,  
        })

        // 验证用户存在以后，将用户新创建的行程信息插入行程设置表 "planSettings"
        const plan = await ctx.db.insert('planSettings',{
            userId: userId,
            planId: newPlan,
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

        // 打印日志
        console.log(
            `createEmptyPlan called by ${userId} on planId : ${newPlan}`
        );

        return newPlan;  // 返回 planId
    }
})

// 获取一个用户的所有行程设置
export const getHistoryPlan = query({
    handler: async(ctx) => {
        // 获取当前登录用户身份
        const userId = await validateUser(ctx);  // 获取用户 Id

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

// 根据 planId 获取行程设置
export const getPlanSettings = internalQuery({
    args: {
        planId: v.id("planDetails"),
    },
    handler: async (ctx, { planId }) => {
        console.log(
        `getPlanSettings called by prepare batch internally for planId : ${planId}`
        );

        // 获取行程设置表的记录
        const planSetting = await ctx.db
        .query("planSettings")
        .filter((q) => q.eq(q.field("planId"), planId))
        .first();
        
        return planSetting;
    },
});

// 删除行程
export const deletePlan = mutation({
  args: { 
    planId: v.string() 
  },
  async handler(ctx, args) {
    // 校验用户身份
    const userId = await validateUser(ctx);  // 获取用户 Id

    console.log(
      `deletePlan called by ${userId} on planId : ${args.planId}`
    );

    const planId = args.planId as Id<"planDetails">;
    const plan = await ctx.db.get(planId);  // 获取行程记录

    // 判断行程是否存在
    if (!plan) {
      throw new ConvexError(
        "无法查找到 planId, 无法删除!"
      );
    }

    // 判断用户是否是行程的创建者
    if (plan.userId !== userId) {
      throw new ConvexError("你不是该行程的创建者, 无法删除行程!");
    }

    // 删除 planSettings 表的记录
    const planSettings = await ctx.db
      .query("planSettings")
      .filter((q) => q.eq(q.field("planId"), planId))
      .first();
    
    // 删除存储系统中的封面
    if (planSettings){
      try {
        if (planSettings.imageStorageId) {
          await ctx.storage.delete(planSettings.imageStorageId as Id<"_storage">);
        }
      } catch (e) {
        console.log(e);
      }
      await ctx.db.delete(planSettings?._id);
    } 

    // 删除行程记录
    await ctx.db.delete(planId);
  },
});

// 在行程表中多添加一天
export const addDayInItinerary = mutation({
  args: {
    planId: v.id("planDetails"),
    itineraryDay: v.object({
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
    }),
  },
  handler: async (ctx, { planId, itineraryDay }) => {
    // 获取当前登录用户身份
    const userId = await validateUser(ctx);  // 获取用户 Id
    console.log(`addDayInItinerary called by ${userId} on planId : ${planId}`);

    const data = await ctx.db.get(planId);  // 根据 planId 获取行程记录 
    if (!data) return;

    // 向数据表添加记录
    await ctx.db.patch(planId, {
      itinerary: [
        ...data.itinerary,
        { ...itineraryDay, title: `Day ${data.itinerary.length + 1}` },
      ],
    });
  },
});


// 在行程表删除一天
export const deleteDayInItinerary = mutation({
  args: { 
    dayName: v.string(),
    planId: v.id("planDetails") 
  },
  handler: async (ctx, args) => {
    // 获取当前登录用户身份
    const userId = await validateUser(ctx);  // 获取用户 Id
    console.log(
      `deleteDayInItinerary called by ${userId} on planId : ${args.planId}`
    );

    const data = await ctx.db.get(args.planId);  // 获取行程记录
    if (!data) return;
    // 过滤数据
    await ctx.db.patch(args.planId, {
      itinerary: data.itinerary.filter((d) => !d.title.includes(args.dayName)),
    });
  },
});

// ===== 在调用大模型后将生成的内容加入数据表中 =====

// 更新 旅行清单和当地美食
export const update_PackingChecklist_LocalFood = internalMutation({
    args: {
        planId: v.id("planDetails"),
        packingchecklist: v.array(v.string()),
        localfood: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const plan = await ctx.db.get(args.planId);  // 获取行程记录
        console.log(
            `update_PackingChecklist_LocalFood called on planId : ${args.planId}`
        );

        // 更新数据表中的 旅行清单和当地美食
        await ctx.db.patch(args.planId, {
            packingchecklist: args.packingchecklist,
            localfood: args.localfood,
            contentGenerationState: {
            ...plan!.contentGenerationState,
            packingchecklist: true,
            localfood: true,
            },
        });
    },
});

// 更新 目的地介绍和最佳旅行时间
export const update_AboutThePlace_BestTimeToVisit = internalMutation({
  args: {
    planId: v.id("planDetails"),
    abouttheplace: v.string(),
    besttimetovisit: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);  // 获取行程记录
    console.log(
      `update_AboutThePlace_BestTimeToVisit called on planId : ${args.planId}`
    );
    // 向数据表中添加记录
    await ctx.db.patch(args.planId, {
      abouttheplace: args.abouttheplace,
      besttimetovisit: args.besttimetovisit,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        abouttheplace: true,
        besttimetovisit: true,
      },
    });
  },
});

// 更新行程表到数据库
export const update_Itinerary = internalMutation({
  args: {
    planId: v.id("planDetails"),
    itinerary: v.array(
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
  },
  handler: async (ctx, args) => {
    // 读取详细行程记录
    const plan = await ctx.db.get(args.planId);
    console.log(
      `update_Itinerary called on planId : ${args.planId}`
    );
    // 更新行程表
    await ctx.db.patch(args.planId, {
      itinerary: args.itinerary,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        itinerary: true,
      },
    });
  },
});

// 点击 "编辑" 按钮更新部分信息
export const updatePartOfPlan = mutation({
  args: {
    planId: v.id("planDetails"),
    data: v.union(
      v.string(),
      v.array(v.string()),
    ),
    key: v.union(
      v.literal("abouttheplace"),
      v.literal("besttimetovisit"),
      v.literal("packingchecklist"),
      v.literal("localfood"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await validateUser(ctx);  // 获取用户 Id
    console.log(
      `updatePartOfPlan called by ${useId} on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      [args.key]: args.data,
    });
  },
});


// 根据 planId 读取详细行程，内部接口
export const readPlanData = internalQuery({
    args: { 
        id: v.id("planDetails") 
    },
    handler: async (ctx, args) => {
        const plan = await ctx.db.get(args.id);
        return plan;
    },
});

// 根据内部接口 readPlanData 查询行程数据返回
const fetchEmptyPlan = async (ctx: ActionCtx, planId: string) => {
  return ctx.runQuery(internal.travelplan.readPlanData, {
    id: planId as Id<"planDetails">,
  });
};

// ==== 调用 AI 生成内容 ====

// Batch1 调用 AI 生成目的地介绍（abouttheplace）和最佳旅行时间（besttimetovisit）。
export const prepareBatch1 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
        // 根据 planId 调用一个经过初始化的空行程记录
        const emptyPlan = await fetchEmptyPlan(ctx, planId);

        if (!emptyPlan) {
            throw new ConvexError(
                "无法找到行程记录!"
            );
        }

        // 调用 generatebatch1 生成 目的地介绍 和 最佳旅行时间
        const completion = await generatebatch1(emptyPlan.userPrompt);
        // 解析 AI 的响应
        const nameMsg = completion?.choices[0]?.message?.tool_calls?.[0].function?.arguments as string;

        // 把字符串 nameMsg 解析成 JavaScript 对象
        const modelName = JSON.parse(nameMsg) as Pick<
            Doc<"planDetails">,
            "abouttheplace" | "besttimetovisit"
        >;

        // 调用内部接口，将生成的 目的地介绍 和 最佳旅行时间 插入数据表
        await ctx.runMutation(internal.travelplan.update_AboutThePlace_BestTimeToVisit, {
            abouttheplace: modelName.abouttheplace,
            besttimetovisit: modelName.besttimetovisit,
            planId: emptyPlan._id,
        });
    } catch (error) {
        throw new ConvexError(
            `Error occured in prepare Plan Convex action: ${error}`
        );
    }
  },
});

// Batch2 调用 AI 生成 当地美食 和 旅行清单
export const prepareBatch2 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      console.log({ planId });

      // 读取详细行程记录
      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        console.error(
          "无法找到行程记录!"
        );
        return null;
      }

      // 读取行程设置记录 
      const planMetadata = await ctx.runQuery(
        internal.travelplan.getPlanSettings,
        {
          planId: emptyPlan._id,
        }
      );

      if (!planMetadata) {
        console.error(
          "无法查找到行程数据!"
        );
        return null;
      }

      const { travelPersons, fromDate, toDate } = planMetadata;

      // 调用大模型生成数据
      const completion = await generatebatch2({
        userPrompt: emptyPlan.userPrompt,
        travelPersons,
        fromDate,
        toDate,
      });

      // 将 AI 的回复断言为字符串类型
      const nameMsg = completion?.choices[0]?.message?.tool_calls?.[0].function?.arguments as string;

      // 解析数据为 字段对象
      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"planDetails">,
        | "localfood"
        | "packingchecklist"
      >;

      // 将生成内容插入数据表
      await ctx.runMutation(
        internal.travelplan.update_PackingChecklist_LocalFood,
        {
          localfood: modelName.localfood,
          packingchecklist: modelName.packingchecklist,
          planId: emptyPlan._id,
        }
      );
    } catch (error) {
      throw new Error(`Error occured in prepare Plan Convex action: ${error}`);
    }
  },
});

// Batch3 调用 AI 生成 行程表
export const prepareBatch3 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
        // 获取行程记录
        const emptyPlan = await fetchEmptyPlan(ctx, planId);
        if (!emptyPlan) {
            console.error(
            "无法查找到行程记录! 请检查 planId 是否正确!"
            );
            return null;
        }

        // 获取行程设置记录
        const planMetadata = await ctx.runQuery(
            internal.travelplan.getPlanSettings,
            {
            planId: emptyPlan._id,
            }
        );
        if (!planMetadata) {
            console.error(
            "无法查找到行程记录! "
            );
            return null;
        }

        const { travelType, travelPersons, fromDate, toDate } = planMetadata;

        const completion = await generatebatch3({
            userPrompt: emptyPlan.userPrompt,
            travelType,
            travelPersons,
            fromDate,
            toDate,
        });

        const nameMsg = completion?.choices[0]?.message?.tool_calls?.[0].function?.arguments as string;

        const modelName = JSON.parse(nameMsg) as Pick<
            Doc<"planDetails">,
            "itinerary"
        >;

        await ctx.runMutation(internal.travelplan.update_Itinerary, {
            itinerary: modelName.itinerary,
            planId: emptyPlan._id,
        });

    } catch (error) {
        throw new ConvexError(
            `Error occured in prepare Plan Convex action: ${error}`
        );
    }
  },
});

