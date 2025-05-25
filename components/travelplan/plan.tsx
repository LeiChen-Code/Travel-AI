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
import { useEffect } from "react";
// import Weather from "@/components/sections/Weather";


type PlanProps = {
  planId: string;
  isNewPlan: boolean;
};

const Plan = ({ planId, isNewPlan }: PlanProps) => {

  const { isLoading, plan, shouldShowAlert, error } = usePlan(planId, isNewPlan);
  const { toast } = useToast();


  // 更新地点列表
  const { setLocations } = useMapContext();
  useEffect(() => {
    if (plan) {
      const locations = plan.itinerary.flatMap((day) =>
        (['morning', 'afternoon', 'evening'] as Array<'morning' | 'afternoon' | 'evening'>).flatMap((time) =>
          day.activities[time].map((activity) => ({
            name: activity.place.name,
            position: [activity.place.coordinates.lng, activity.place.coordinates.lat] as [number, number],
          }))
        )
      );
      setLocations(locations);
    }
  }, [plan, setLocations]);


    if (error) {
    // toast({
    //   variant: "destructive",
    //   title: "出错了",
    //   description: error,
    // });
    return null;
  }
  
  if (!plan) {
    // ! 明明已经生成内容了，但会报错，是为什么
    // toast({
    //   variant: "destructive",
    //   title: "未找到行程",
    //   description: "该行程不存在或已被删除。",
    // });
    return null;
  }

  return (

    <section className="w-full h-full flex flex-col gap-5">
      
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
      
      <Itinerary
        itinerary={plan?.itinerary}
        planId={planId}
        isLoading={isLoading || !plan?.contentGenerationState.itinerary}
        allowEdit={true}
      />
      <LocalFoodRecommendations
        recommendations={plan?.localfood}
        isLoading={
          isLoading || !plan?.contentGenerationState.localfood
        }
        planId={planId}
        allowEdit={true}
      />
      <PackingChecklist
        checklist={plan?.packingchecklist}
        isLoading={isLoading || !plan?.contentGenerationState.packingchecklist}
        planId={planId}
        allowEdit={true}
      />
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