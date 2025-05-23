import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { useQuery } from "convex/react";

const usePlan = (planId: string, isNewPlan: boolean) => {
  try {
    // 调用内部接口获取行程记录
    const plan = useQuery(api.travelplan.getSinglePlan, {
      id: planId as Id<"planDetails">,
    });

    const shouldShowAlert =
      plan?.isGeneratedUsingAI &&
      isNewPlan &&
      plan &&
      Object.values(plan.contentGenerationState).some(
        (value) => value === false
      )
        ? true
        : false;

    return {
      shouldShowAlert,
      plan,
      isLoading: !plan,
    };

  } catch (error) {
    let errorMessage: string = "Something went wrong!";
    if (error instanceof ConvexError) {
      errorMessage = error.data as string;
    }
    return {
      shouldShowAlert: false,
      plan: null,
      isLoading: false,
      error: errorMessage,
    };
  }
};

export default usePlan;