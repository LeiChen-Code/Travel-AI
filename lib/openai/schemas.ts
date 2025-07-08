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

export const batch3Schema = z.object({
  itinerary: z.array(
    z.object({
      title: z.string(),
      activities: z.object({
        morning: z.array(
          z.object({
            itineraryItem: z.string(),
            place: z.object({
                name: z.string(),
                coordinates: z.object({
                    lat: z.number(),
                    lng: z.number(),
                }),
            }),
            briefDescription: z.string().optional(),
          })
        ),
        afternoon: z.array(
          z.object({
            itineraryItem: z.string(),
            place: z.object({
                name: z.string(),
                coordinates: z.object({
                    lat: z.number(),
                    lng: z.number(),
                }),
            }),
            briefDescription: z.string().optional(),
          })
        ),
        evening: z.array(
          z.object({
            itineraryItem: z.string(),
            place: z.object({
                name: z.string(),
                coordinates: z.object({
                    lat: z.number(),
                    lng: z.number(),
                }),
            }),
            briefDescription: z.string().optional(),
          })
        ),
      }),
    })
  ),
});