// "use client";
// import { Doc } from "@/convex/_generated/dataModel";
// import usePlan from "@/hooks/usePlan";
// import { useSearchParams } from "next/navigation";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   Dispatch,
//   SetStateAction,
//   useEffect,
// } from "react";

// import AccessDenied from "@/components/travelplan/AccessDenied";

// // 定义了旅行计划的内容生成状态类型
// type planStateType = Doc<"planDetails">["contentGenerationState"] & {
//   weather: boolean;
// };

// // 定义上下文的整体类型
// type PlanContextType = {
//   planState: planStateType;
//   setPlanState: Dispatch<SetStateAction<planStateType>>;
//   shouldShowAlert: boolean;
//   plan:
//     | (Doc<"planDetails">  & Pick<
//           Doc<"planSettings">,
//           | "travelType"
//           | "travelPersons"
//           | "fromDate"
//           | "toDate"
//         >)
//     | null
//     | undefined;
//   isLoading: boolean;
// };
// // 为状态提供默认值
// const defaultPlanState: planStateType = {
//   imagination: false,
//   abouttheplace: false,
//   itinerary: false,
//   localfood: false,
//   packingchecklist: false,
//   besttimetovisit: false,
//   weather: false,
// };

// // 创建上下文对象
// const PlanContext = createContext<PlanContextType | undefined>({
//   planState: defaultPlanState,
//   setPlanState: () => {},
//   shouldShowAlert: false,
//   plan: undefined,
//   isLoading: false,
// });

// // 获取上下文的函数
// export const usePlanContext = () => {

//   console.log("usePlanContext");
//   const context = useContext(PlanContext);
  
//   if (context === undefined) {
//     throw new Error("usePlanContext must be used within a PlanContextProvider");
//   }
//   return context;
// };

// // 管理和更新上下文状态
// const PlanContextProvider = ({
//   children,
//   planId,
// }: {
//   children: React.ReactNode;
//   planId: string;
//   isPublic: boolean;
// }) => {
//   // 状态初始化
//   const [planState, setPlanState] = useState<planStateType>(defaultPlanState);
                
//   const searchParams = useSearchParams();  // 获取 URL 中的查询参数，判断是否为新计划

//   const isNewPlan = Boolean(searchParams.get("isNewPlan"));

//   // 根据 planId、isNewPlan 获取计划的相关信息
//   const { shouldShowAlert, plan, isLoading, error } = usePlan(
//     planId,
//     isNewPlan,
//   );

//   // 监听 plan 的变化
//   useEffect(() => {
//     if (isLoading || !plan) return;

//     setPlanState((state) => ({
//       ...plan.contentGenerationState,
//       weather: state.weather,
//     }));

//   }, [plan]);

//   return (
//     <PlanContext.Provider
//       value={{ planState, shouldShowAlert, plan, isLoading, setPlanState }}
//     >
//       {error ? <AccessDenied /> : children}
//     </PlanContext.Provider>
//   );
// };

// export default PlanContextProvider;