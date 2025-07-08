import { z } from "zod";

// 此文件定义三个 JSON 模式，分别对应不同批次的 AI 生成需求，验证 AI 生成的 JSON 数据格式

export const batch1Schema = z.object({
  abouttheplace: z.string().min(50),
  besttimetovisit: z.string(),
});

export const batch2Schema = z.object({
  localfood: z.array(z.string()),
  packingchecklist: z.array(z.string()),
});


// 坐标模式 - 增强验证
const coordinatesSchema = z.object({
  lat: z.number().refine(val => val >= -90 && val <= 90, {
    message: "纬度必须在-90到90之间"
  }),
  lng: z.number().refine(val => val >= -180 && val <= 180, {
    message: "经度必须在-180到180之间"
  })
}).strict();

// 地点模式 - 增强验证
export const placeSchema = z.object({
  name: z.string().min(2, "地点名称至少需要2个字符"),
  coordinates: coordinatesSchema
}).strict();

// 活动项模式 - 统一结构
export const activityItemSchema = z.object({
  itineraryItem: z.string().min(3, "活动名称至少需要3个字符"),
  place: placeSchema,
  briefDescription: z.string().min(100, "描述至少需要100个字符")
}).strict();

// 每日活动模式 - 简化结构
export const dailyActivitiesSchema = z.object({
  morning: z.array(activityItemSchema),
  afternoon: z.array(activityItemSchema),
  evening: z.array(activityItemSchema)
}).strict();

// 每日行程模式
export const dailyItinerarySchema = z.object({
  title: z.string(),
  activities: dailyActivitiesSchema
}).strict();

// batch3 行程规划模式
export const batch3Schema = z.object({
  itinerary: z.array(dailyItinerarySchema)
    .min(1, "至少需要一天的行程")
    .max(30, "行程最多支持30天")
}).strict();