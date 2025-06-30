import { Doc, Id } from "@/convex/_generated/dataModel";
import { Dispatch, SetStateAction } from "react";

// 定义图像生成的属性
export interface GenerateThumbnailProps{
    imgPrompt:string,
    setImgPrompt:Dispatch<SetStateAction<string>>,
    imgURL:string,
    setImage: Dispatch<SetStateAction<string>>,
    setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>,
}

// 定义行程卡片组件的属性
export interface TravelCardProps{
    imgURL: string,
    title: string,
    fromDate: number,
    toDate: number,
    planId: Id<"planDetails"> | undefined,
}

// 描述旅行目的地组件的属性
export interface AboutThePlaceProps {
  content: string | undefined;  // 关于旅行地点的描述内容
  isLoading: boolean;  // 是否正在加载
  planId: string;  // 行程 Id
  allowEdit: boolean; // 是否允许编辑
};

// 描述最佳旅行时间组件的属性
export interface BestTimeToVisitProps {
  content: string | undefined;
  isLoading: boolean;
  planId: string;
  allowEdit: boolean;
};

// 行程表组件的属性
export interface ItineraryProps {
  itinerary: Doc<"planDetails">["itinerary"] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

// 描述当地美食组件的属性
export interface LocalFoodProps {
  recommendations: string[] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

// 描述行李清单组件的属性
export interface PackingChecklistProps {
  checklist: string[] | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

// 定义 timeline 组件的属性
export interface TimelineProps {
  itinerary: Doc<"planDetails">["itinerary"] | undefined;
  planId: string;
  allowEdit: boolean;
};

// 定义 ItineraryDayHeaderProps 组件的属性
export interface ItineraryDayHeaderProps {
  title: string;
  planId: string;
  allowEdit: boolean;
  itineraryDay: Doc<"planDetails">["itinerary"][number];
};

// 定义生成行程需要的属性
export interface GeneratePlanProps{
  planTitle: string,
  travelPlace: string,
  fromDate: number,
  toDate: number,
  noOfDays: string,
  travelPersons: number,
  travelType: string | undefined,
  budget: number,
  imageURL: string,
  imageStorageId: Id<"_storage">
}