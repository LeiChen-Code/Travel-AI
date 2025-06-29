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
import { useEffect, useRef } from "react";
// import Weather from "@/components/sections/Weather";

// 该组件实现行程内容展示

type PlanProps = {
  planId: string;
  isNewPlan: boolean;
};

const Plan = ({ planId, isNewPlan }: PlanProps) => {

  // 调用 usePlan hook 获取当前行程信息和行程生成的状态
  const { isLoading, plan, shouldShowAlert, error } = usePlan(planId, isNewPlan);
  const { toast } = useToast();

  // 只弹一次 toast 的辅助 ref
  // 标记错误提示是否已经弹出
  const hasShownError = useRef(false);

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


  // !更新地点列表
  // 调用 useMapContext 上下文 hook 中获取 setLocations 方法，更新地点列表
  const { setLocations } = useMapContext();
  // 使用 useEffect 监听 plan 的变化，当 plan 更新时触发
  useEffect(() => {
    if (plan) {
      // 遍历行程的每一天
      const locations = plan.itinerary.flatMap((day) =>
        // 遍历一天的三个时间段
        (['morning', 'afternoon', 'evening'] as Array<'morning' | 'afternoon' | 'evening'>).flatMap((time) =>
          day.activities[time].map((activity) => ({
            // 遍历每个时间段的活动，记录每个活动的地点名称和经纬度坐标
            name: activity.place.name,
            position: [activity.place.coordinates.lng, activity.place.coordinates.lat] as [number, number],
          }))
        )
      );

      // 将行程中的地点信息同步到地图上下文中
      setLocations(locations);
    }
  }, [plan, setLocations]);

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
      {/* <Weather placeName={plan?.nameoftheplace} /> */}
      
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