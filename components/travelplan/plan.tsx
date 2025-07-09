"use client";

import AboutThePlace from "@/components/sections/AboutThePlace";
import BestTimeToVisit from "@/components/sections/BestTimeToVisit";
import Itinerary from "@/components/sections/Itinerary";
import LocalFoodRecommendations from "@/components/sections/LocalFood";
import PackingChecklist from "@/components/sections/PackingChecklist";
import usePlan from "@/hooks/usePlan";
import AlertForAI from "../sections/AlertForAI";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Weather from "../sections/Weather";
import { useMapContext } from "@/contexts/MapContext";
import { fillCoordinatesForItinerary } from "@/lib/amap/fillCoordinates";

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
    const run = async () => {
      if (!travelPlace || !plan) return;

      // 提取 locations
      const rawLocations = plan.itinerary.flatMap((day) =>
        (['morning', 'afternoon', 'evening'] as const).flatMap((time) =>
          day.activities[time].map((activity) => ({
            name: activity.place.name,
            position: [
              activity.place.coordinates?.lng ?? 0,
              activity.place.coordinates?.lat ?? 0,
            ] as [number, number],
          }))
        )
      );

      // 执行坐标校验
      const updatedLocations = await fillCoordinatesForItinerary(travelPlace, rawLocations);

      // 去重（避免重复点）
      const uniqueMap = new Map<string, [number, number]>();
      for (const loc of updatedLocations) {
        if (!uniqueMap.has(loc.name)) {
          uniqueMap.set(loc.name, loc.position!);
        }
      }

      // 写入 MapContext
      const dedupedLocations = Array.from(uniqueMap.entries()).map(([name, position]) => ({
        name,
        position,
      }));
      setLocations(dedupedLocations);
    };

    run();
  }, [plan, setLocations, travelPlace]);


  // 出错或行程记录为空时返回空
  if (error || !plan) {
    return null;
  }

  return (

    <section className="w-full h-full flex flex-col gap-2">
      
      {/* 在 AI 生成未完成前弹出提示框 */}
      <AlertForAI show={shouldShowAlert} />

      {/* 展示天气 */}
      <Weather placeName={travelPlace} />
      
      {/* 展示旅行目的地 */}
      <AboutThePlace
        isLoading={isLoading || !plan?.contentGenerationState.abouttheplace}
        planId={planId}
        content={plan?.abouttheplace}
        allowEdit={true}
      />

      {/* 展示最佳旅行时间 */}
      <BestTimeToVisit
        content={plan?.besttimetovisit}
        planId={planId}
        isLoading={isLoading || !plan?.contentGenerationState.besttimetovisit}
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
 
      {/* 展示行程表 */}
      <Itinerary
        itinerary={plan?.itinerary}
        planId={planId}
        isLoading={isLoading || !plan?.contentGenerationState.itinerary}
        allowEdit={true}
      />
    </section>
  );
};

export default Plan;