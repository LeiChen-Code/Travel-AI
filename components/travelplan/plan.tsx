"use client";

import AboutThePlace from "@/components/sections/AboutThePlace";
import BestTimeToVisit from "@/components/sections/BestTimeToVisit";
import Itinerary from "@/components/sections/Itinerary";
import LocalFoodRecommendations from "@/components/sections/LocalFood";
import PackingChecklist from "@/components/sections/PackingChecklist";
import usePlan from "@/hooks/usePlan";
import AlertForAI from "../sections/AlertForAI";
import { useToast } from "@/hooks/use-toast";
import { useMapContext } from "@/contexts/MapContext";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Weather from "../sections/Weather";
import { useFillItineraryCoordinates } from "@/hooks/useFillItineraryCoordinates";

// 该组件实现行程内容展示

type PlanProps = {
  planId: string;
  isNewPlan: boolean;
};

const Plan = ({ planId, isNewPlan }: PlanProps) => {

  // 调用 usePlan hook 获取当前行程信息和行程生成的状态
  const { isLoading, plan, shouldShowAlert, error } = usePlan(planId, isNewPlan);
  const { toast } = useToast();

  // 根据 planId 获取 planSettings 记录
  const planSettings = useQuery(api.travelplan.getSinglePlan, { id: planId as Id<"planDetails"> });
  const travelPlace = planSettings?.travelPlace;

  // 只弹一次 toast 的辅助 ref
  // 标记错误提示是否已经弹出
  const hasShownError = useRef(false);

  // 更新行程表方法
  const updateItinerary = useMutation(api.travelplan.update_Itinerary);

  // 错误提示
  useEffect(() => {
    if (error && !hasShownError.current) {
      toast({
        variant: "destructive",
        title: "生成行程出错",
        description: error,
      });
      hasShownError.current = true;
    }
  }, [error, toast]);

  // 调用 PlaceSearch 实例来查询行程表中的地点，并校验经纬度信息
  // ! 同时在这里更新地点列表
  const { newItinerary, isReady } = useFillItineraryCoordinates(
    travelPlace!,
    plan?.itinerary!
  );

  // 使用 useEffect 监听 plan 的变化，当 plan 更新时触发
  useEffect(() => {
    if (isReady && newItinerary && plan) {
      updateItinerary({
          itinerary: newItinerary,
          planId: planId as Id<"planDetails">, // 假设所有天数的 planId 相同
      });
    }
    // ? 此处是否还需要再一次 setLocation ?
  }, [plan, isReady, newItinerary, updateItinerary]);

  // 出错或行程记录为空时返回空
  if (error || !plan) {
    return null;
  }

  return (

    <section className="w-full h-full flex flex-col gap-2">
      
      {/* 在 AI 生成未完成前弹出提示框 */}
      <AlertForAI show={shouldShowAlert} />

      {/* 展示行程设置 */}
      {/* <PlanMetaData
        allowEdit={true}
        companionId={plan?.companion}
        activityPreferencesIds={plan?.activityPreferences ?? []}
        fromDate={plan?.fromDate ?? undefined}
        toDate={plan?.toDate ?? undefined}
        planId={planId}
        isLoading={isLoading}
      /> */}
      
      {/* 展示旅行目的地 */}
      <AboutThePlace
        isLoading={isLoading || !plan?.contentGenerationState.abouttheplace}
        planId={planId}
        content={plan?.abouttheplace}
        allowEdit={true}
      />

      {/* 展示天气 */}
      <Weather placeName={travelPlace} />
      
      {/* 展示行程表 */}
      <Itinerary
        itinerary={plan?.itinerary}
        planId={planId}
        isLoading={isLoading || !plan?.contentGenerationState.itinerary}
        allowEdit={true}
      />

      {/* 展示当地美食推荐 */}
      <LocalFoodRecommendations
        recommendations={plan?.localfood}
        isLoading={
          isLoading || !plan?.contentGenerationState.localfood
        }
        planId={planId}
        allowEdit={true}
      />

      {/* 展示旅行清单 */}
      <PackingChecklist
        checklist={plan?.packingchecklist}
        isLoading={isLoading || !plan?.contentGenerationState.packingchecklist}
        planId={planId}
        allowEdit={true}
      />

      {/* 展示最佳旅行时间 */}
      <BestTimeToVisit
        content={plan?.besttimetovisit}
        planId={planId}
        isLoading={isLoading || !plan?.contentGenerationState.besttimetovisit}
        allowEdit={true}
      />
    </section>
  );
};

export default Plan;