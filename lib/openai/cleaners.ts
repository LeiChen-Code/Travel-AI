// utils/itineraryCleaner.ts
import { activityItemSchema, batch3Schema } from "./schemas";
import type { z } from "zod";

// 清洗单个活动项
export const cleanActivityItem = (item: any): z.infer<typeof activityItemSchema> => {
  return {
    itineraryItem: String(item.itineraryItem || ""),
    place: {
      name: String(item.place?.name || ""),
      coordinates: {
        lat: parseFloat(item.place?.coordinates?.lat) || 0,
        lng: parseFloat(item.place?.coordinates?.lng) || 0
      }
    },
    briefDescription: String(item.briefDescription || "")
  };
};

// 清洗整个行程
export const cleanItineraryData = (data: any): z.infer<typeof batch3Schema> => {
  // 基本结构验证
  if (!data || !Array.isArray(data.itinerary)) {
    throw new Error("无效的行程数据结构");
  }

  const cleanedItinerary = data.itinerary.map((day: any) => {
    const activities: any = {};
    
    // 处理每个时间段
    ["morning", "afternoon", "evening"].forEach(timeSlot => {
      if (Array.isArray(day.activities?.[timeSlot])) {
        activities[timeSlot] = day.activities[timeSlot]
          .filter((item: any) => item !== null && typeof item === "object")
          .map(cleanActivityItem);
      }
    });

    return {
      title: String(day.title || `第${day.dayIndex || 1}天行程`),
      activities
    };
  });

  // 验证清洗后的数据
  const result = batch3Schema.safeParse({ itinerary: cleanedItinerary });
  
  if (!result.success) {
    console.error("行程数据验证失败:", result.error);
    throw new Error("行程数据格式错误");
  }

  return result.data;
};