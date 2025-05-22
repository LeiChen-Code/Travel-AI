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
import { getCurrentPlanSettings } from "./planSettings";
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


// 根据 planId 读取详细行程
export const readPlanData = internalQuery({
  args: { id: v.id("planDetails") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id);
    return plan;
  },
});
// 根据内部接口 readPlanData 查询行程数据返回
const fetchEmptyPlan = async (ctx: ActionCtx, planId: string) => {
  return ctx.runQuery(internal.plan.readPlanData, {
    id: planId as Doc<"planDetails">["_id"],
  });
};

//Actions to be called for prepareing the plan
// 根据指定的 planId，AI 生成行程并写入数据库，分批次调用
// Batch1 补全目的地介绍（abouttheplace）和最佳旅行时间（besttimetovisit）。
export const prepareBatch1 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        throw new ConvexError(
          "Unable to find the empty plan while preparing a new one"
        );
      }

      // 调用 generatebatch1
      const completion = await generatebatch1(emptyPlan.userPrompt);

      const nameMsg = completion?.choices[0]?.message?.function_call
        ?.arguments as string;

      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"plan">,
        "abouttheplace" | "besttimetovisit"
      >;

      await ctx.runMutation(internal.plan.updateAboutThePlaceBestTimeToVisit, {
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

export const prepareBatch2 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      console.log({ planId });

      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        console.error(
          "Unable to find the empty plan while preparing a new one"
        );
        return null;
      }

      const planMetadata = await ctx.runQuery(
        internal.planSettings.getPlanSettings,
        {
          planId: emptyPlan._id,
        }
      );

      if (!planMetadata) {
        console.error(
          "Unable to find the plan metadata while preparing a new one"
        );
        return null;
      }
      const { activityPreferences, companion, fromDate, toDate } = planMetadata;

      const completion = await generatebatch2({
        userPrompt: emptyPlan.userPrompt,
        activityPreferences,
        companion,
        fromDate,
        toDate,
      });

      const nameMsg = completion?.choices[0]?.message?.function_call
        ?.arguments as string;

      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"plan">,
        | "adventuresactivitiestodo"
        | "localcuisinerecommendations"
        | "packingchecklist"
      >;

      await ctx.runMutation(
        internal.plan
          .updateActivitiesToDoPackingChecklistLocalCuisineRecommendations,
        {
          adventuresactivitiestodo: modelName.adventuresactivitiestodo,
          localcuisinerecommendations: modelName.localcuisinerecommendations,
          packingchecklist: modelName.packingchecklist,
          planId: emptyPlan._id,
        }
      );
    } catch (error) {
      throw new Error(`Error occured in prepare Plan Convex action: ${error}`);
    }
  },
});

export const prepareBatch3 = action({
  args: {
    planId: v.string(),
  },
  handler: async (ctx, { planId }) => {
    try {
      const emptyPlan = await fetchEmptyPlan(ctx, planId);

      if (!emptyPlan) {
        console.error(
          "Unable to find the empty plan while preparing a new one"
        );
        return null;
      }
      const planMetadata = await ctx.runQuery(
        internal.planSettings.getPlanSettings,
        {
          planId: emptyPlan._id,
        }
      );

      if (!planMetadata) {
        console.error(
          "Unable to find the plan metadata while preparing a new one"
        );
        return null;
      }
      const { activityPreferences, companion, fromDate, toDate } = planMetadata;

      const completion = await generatebatch3({
        userPrompt: emptyPlan.userPrompt,
        activityPreferences,
        companion,
        fromDate,
        toDate,
      });

      const nameMsg = completion?.choices[0]?.message?.function_call
        ?.arguments as string;

      const modelName = JSON.parse(nameMsg) as Pick<
        Doc<"plan">,
        "itinerary" | "topplacestovisit"
      >;

      await ctx.runMutation(internal.plan.updateItineraryTopPlacesToVisit, {
        itinerary: modelName.itinerary,
        topplacestovisit: modelName.topplacestovisit,
        planId: emptyPlan._id,
      });
    } catch (error) {
      throw new ConvexError(
        `Error occured in prepare Plan Convex action: ${error}`
      );
    }
  },
});

//Mutation Patches after openAi responds
export const updateAboutThePlaceBestTimeToVisit = internalMutation({
  args: {
    planId: v.id("plan"),
    abouttheplace: v.string(),
    besttimetovisit: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    console.log(
      `updateAboutThePlaceBestTimeToVisit called on planId : ${args.planId}`
    );
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

export const updateActivitiesToDoPackingChecklistLocalCuisineRecommendations =
  internalMutation({
    args: {
      planId: v.id("plan"),
      adventuresactivitiestodo: v.array(v.string()),
      packingchecklist: v.array(v.string()),
      localcuisinerecommendations: v.array(v.string()),
    },
    handler: async (ctx, args) => {
      const plan = await ctx.db.get(args.planId);
      console.log(
        `updateActivitiesToDoPackingChecklistLocalCuisineRecommendations called on planId : ${args.planId}`
      );
      await ctx.db.patch(args.planId, {
        adventuresactivitiestodo: args.adventuresactivitiestodo,
        packingchecklist: args.packingchecklist,
        localcuisinerecommendations: args.localcuisinerecommendations,
        contentGenerationState: {
          ...plan!.contentGenerationState,
          adventuresactivitiestodo: true,
          packingchecklist: true,
          localcuisinerecommendations: true,
        },
      });
    },
  });

export const updateItineraryTopPlacesToVisit = internalMutation({
  args: {
    planId: v.id("plan"),
    topplacestovisit: v.array(
      v.object({
        name: v.string(),
        coordinates: v.object({
          lat: v.float64(),
          lng: v.float64(),
        }),
      })
    ),
    itinerary: v.array(
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
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    console.log(
      `updateItineraryTopPlacesToVisit called on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      topplacestovisit: args.topplacestovisit,
      itinerary: args.itinerary,
      contentGenerationState: {
        ...plan!.contentGenerationState,
        topplacestovisit: true,
        itinerary: true,
      },
    });
  },
});

//edit in UI

export const updatePartOfPlan = mutation({
  args: {
    planId: v.id("plan"),
    data: v.union(
      v.string(),
      v.array(v.string()),
      v.array(
        v.object({
          name: v.string(),
          coordinates: v.object({
            lat: v.float64(),
            lng: v.float64(),
          }),
        })
      )
    ),
    key: v.union(
      v.literal("abouttheplace"),
      v.literal("besttimetovisit"),
      v.literal("packingchecklist"),
      v.literal("localcuisinerecommendations"),
      v.literal("adventuresactivitiestodo"),
      v.literal("topplacestovisit")
    ),
  },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `updatePartOfPlan called by ${subject} on planId : ${args.planId}`
    );
    await ctx.db.patch(args.planId, {
      [args.key]: args.data,
    });
  },
});

export const updatePlaceToVisit = mutation({
  args: {
    planId: v.id("plan"),
    lat: v.float64(),
    lng: v.float64(),
    placeName: v.string(),
  },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `updatePlaceToVisit called by ${subject} on planId : ${args.planId}`
    );
    const plan = await ctx.db.get(args.planId);
    if (!plan) return;
    const existing = plan?.topplacestovisit;
    await ctx.db.patch(plan?._id, {
      topplacestovisit: [
        ...existing,
        {
          name: args.placeName,
          coordinates: {
            lat: args.lat,
            lng: args.lng,
          },
        },
      ],
    });
  },
});

export const deleteDayInItinerary = mutation({
  args: { dayName: v.string(), planId: v.id("plan") },
  handler: async (ctx, args) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(
      `deleteDayInItinerary called by ${subject} on planId : ${args.planId}`
    );

    const data = await ctx.db.get(args.planId);
    if (!data) return;
    await ctx.db.patch(args.planId, {
      itinerary: data.itinerary.filter((d) => !d.title.includes(args.dayName)),
    });
  },
});

export const addDayInItinerary = mutation({
  args: {
    planId: v.id("plan"),
    itineraryDay: v.object({
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
    }),
  },
  handler: async (ctx, { planId, itineraryDay }) => {
    const { subject } = await getIdentityOrThrow(ctx);
    console.log(`addDayInItinerary called by ${subject} on planId : ${planId}`);

    const data = await ctx.db.get(planId);
    if (!data) return;

    await ctx.db.patch(planId, {
      itinerary: [
        ...data.itinerary,
        { ...itineraryDay, title: `Day ${data.itinerary.length + 1}` },
      ],
    });
  },
});

export const createEmptyPlan = mutation({
  args: {
    placeName: v.string(),
    noOfDays: v.string(),
    activityPreferences: v.array(v.string()),
    fromDate: v.number(),
    toDate: v.number(),
    companion: v.optional(v.string()),
    isGeneratedUsingAI: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await getIdentityOrThrow(ctx);

    const state = !args.isGeneratedUsingAI;

    const newPlan = await ctx.db.insert("plan", {
      nameoftheplace: args.placeName,
      abouttheplace: "",
      adventuresactivitiestodo: [],
      topplacestovisit: [],
      userId: identity.subject,
      userPrompt: `${args.noOfDays} days trip to ${args.placeName}`,
      besttimetovisit: "",
      itinerary: [],
      storageId: null,
      localcuisinerecommendations: [],
      packingchecklist: [],
      isGeneratedUsingAI: args.isGeneratedUsingAI,
      contentGenerationState: {
        imagination: state,
        abouttheplace: state,
        adventuresactivitiestodo: state,
        besttimetovisit: state,
        itinerary: state,
        localcuisinerecommendations: state,
        packingchecklist: state,
        topplacestovisit: state,
      },
    });

    const planId = await ctx.db.insert("planSettings", {
      planId: newPlan,
      userId: identity.subject,
      activityPreferences: args.activityPreferences,
      fromDate: args.fromDate,
      toDate: args.toDate,
      companion: args.companion,
      isPublished: false,
    });

    console.log(
      `createEmptyPlan called by ${identity.subject} on planId : ${planId}`
    );
    return newPlan;
  },
});

export const deletePlan = mutation({
  args: { planId: v.string() },
  async handler(ctx, args) {
    const identity = await getIdentityOrThrow(ctx);
    console.log(
      `deletePlan called by ${identity.subject} on planId : ${args.planId}`
    );
    const planId = args.planId as Id<"plan">;

    const plan = await ctx.db.get(planId);

    if (!plan) {
      throw new ConvexError(
        "There is no such plan to delete with the given Id"
      );
    }

    if (plan.userId !== identity.subject) {
      throw new ConvexError("You are not the owner of this plan.");
    }
    try {
      if (plan.storageId) {
        await ctx.storage.delete(plan.storageId as Id<"_storage">);
      }
    } catch (e) {
      console.log(e);
    }

    const expenseIds = (
      await ctx.db
        .query("expenses")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(expenseIds.map((id) => ctx.db.delete(id)));

    const accessIds = (
      await ctx.db
        .query("access")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(accessIds.map((id) => ctx.db.delete(id)));

    const inviteIds = (
      await ctx.db
        .query("invites")
        .withIndex("by_planId", (q) => q.eq("planId", planId))
        .collect()
    ).map((ex) => ex._id);
    await Promise.all(inviteIds.map((id) => ctx.db.delete(id)));

    const planSettings = await ctx.db
      .query("planSettings")
      .withIndex("by_planId", (q) => q.eq("planId", planId))
      .unique();
    if (planSettings) await ctx.db.delete(planSettings?._id);

    await ctx.db.delete(planId);
  },
});