import { z } from "zod";

// 定义了一天行程的表单校验模式，确保传入的数据结构和内容符合预期

export const ItineraryValidationSchema = z.object({
    itinerary: z.object({
        title: z.string(),  // 行程标题
        activities: z.object({
            morning: z.array(
                z.object({
                    itineraryItem: z.string().min(3),  // 活动名称
                    briefDescription: z.string().min(3),  // 活动描述
                    place: z.object({  // 活动地点
                        name: z.string().min(1),  // 地名
                        coordinates: z.object({  // 经纬度
                            lat: z.number(),
                            lng: z.number(),
                        }),
                    }),
                })
            ),
            afternoon: z.array(
                z.object({
                    itineraryItem: z.string().min(3),
                    briefDescription: z.string().min(3),
                    place: z.object({  // 活动地点
                        name: z.string().min(1),  // 地名
                        coordinates: z.object({  // 经纬度
                            lat: z.number(),
                            lng: z.number(),
                        }),
                    }),
                })
            ),
            evening: z.array(
                z.object({
                    itineraryItem: z.string().min(3),
                    briefDescription: z.string().min(3),
                    place: z.object({  // 活动地点
                        name: z.string().min(1),  // 地名
                        coordinates: z.object({  // 经纬度
                            lat: z.number(),
                            lng: z.number(),
                        }),
                    }),
                })
            ),
        }),
    }),
});