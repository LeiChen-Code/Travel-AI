"use client";
import { Doc } from "@/convex/_generated/dataModel";
import usePlan from "@/hooks/usePlan";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import AccessDenied from "@/components/plan/AccessDenied";

type planStateType = Doc<"planDetails">["contentGenerationState"] & {
  weather: boolean;
};

type PlanContextType = {
  planState: planStateType;
  setPlanState: Dispatch<SetStateAction<planStateType>>;
  shouldShowAlert: boolean;
  plan:
    | (Doc<"planDetails"> & { isSharedPlan: boolean } & Pick<
          Doc<"planSettings">,
          | "travelType"
          | "travelPersons"
          | "fromDate"
          | "toDate"
        >)
    | null
    | undefined;
  isLoading: boolean;
};

const defaultPlanState: planStateType = {
  imagination: false,
  abouttheplace: false,
  itinerary: false,
  localfood: false,
  packingchecklist: false,
  besttimetovisit: false,
  weather: false,
};

const PlanContext = createContext<PlanContextType | undefined>({
  planState: defaultPlanState,
  setPlanState: () => {},
  shouldShowAlert: false,
  plan: undefined,
  isLoading: false,
});

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlanContext must be used within a PlanContextProvider");
  }
  return context;
};

const PlanContextProvider = ({
  children,
  planId,
  isPublic,
}: {
  children: React.ReactNode;
  planId: string;
  isPublic: boolean;
}) => {
  const [planState, setPlanState] = useState<planStateType>(defaultPlanState);

  const searchParams = useSearchParams();

  const isNewPlan = Boolean(searchParams.get("isNewPlan"));

  const { shouldShowAlert, plan, isLoading, error } = usePlan(
    planId,
    isNewPlan,
    isPublic
  );

  useEffect(() => {
    if (isLoading || !plan) return;

    setPlanState((state) => ({
      ...plan.contentGenerationState,
      weather: state.weather,
    }));
  }, [plan]);

  return (
    <PlanContext.Provider
      value={{ planState, shouldShowAlert, plan, isLoading, setPlanState }}
    >
      {error ? <AccessDenied /> : children}
    </PlanContext.Provider>
  );
};

export default PlanContextProvider;