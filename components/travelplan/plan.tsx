"use client";

import AboutThePlace from "@/components/sections/AboutThePlace";
import BestTimeToVisit from "@/components/sections/BestTimeToVisit";
import Itinerary from "@/components/sections/Itinerary";
import LocalFoodRecommendations from "@/components/sections/LocalFood";
import PackingChecklist from "@/components/sections/PackingChecklist";
import usePlan from "@/hooks/usePlan";
// import Weather from "@/components/sections/Weather";


type PlanProps = {
  planId: string;
  isNewPlan: boolean;
};

const Plan = ({ planId, isNewPlan }: PlanProps) => {

  const { isLoading, plan, shouldShowAlert, error } = usePlan(planId, isNewPlan);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!plan) {
    return <div>Plan not found.</div>;
  }

  return (
    <section className="w-full h-full flex flex-col gap-5">

      {/* 展示行程设置 */}
      {/* <PlanMetaData
        allowEdit={true}
        companionId={plan?.companion}
        activityPreferencesIds={plan?.activityPreferences ?? []}
        fromDate={plan?.fromDate ?? undefined}
        toDate={plan?.toDate ?? undefined}
        planId={planId}
        isPublished={plan?.isPublished ?? false}
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