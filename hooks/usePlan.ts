import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { useQuery } from "convex/react";

// 自定义 React Hook，获取和管理某个行程（plan）的数据及相关状态

const usePlan = (planId: string, isNewPlan: boolean) => {
  try {
    // 调用接口获取行程记录
    const plan = useQuery(api.travelplan.getSinglePlan, {
      id: planId as Id<"planDetails">,
    });

    // ! shouldShowAlert 表示行程是否完全生成
    const shouldShowAlert =
      plan?.isGeneratedUsingAI &&
      isNewPlan &&
      plan &&  // contentGenerationState 中所有属性都要为 true 才表示行程全部生成完成
      Object.values(plan.contentGenerationState).some(
        (value) => value === false
      )
        ? true
        : false;
    
    // 返回一个对象
    return {
      shouldShowAlert,
      plan,
      isLoading: !plan,
    };

  } catch (error) {
    // 记录错误信息
    let errorMessage: string = "Something went wrong!";
    if (error instanceof ConvexError) {
      errorMessage = error.data as string;
    }
    // 返回包含错误信息的对象
    return {
      shouldShowAlert: false,
      plan: null,
      isLoading: false,
      error: errorMessage,
    };
  }
};

export default usePlan;