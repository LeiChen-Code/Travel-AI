"use server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { GeneratePlanProps } from "@/types";
import { useAction } from "convex/react";

export async function generatePlanAction({
    planTitle,
    travelPlace,
    fromDate,
    toDate,
    noOfDays,
    travelPersons,
    travelType,
    budget,
    imageURL,
    imageStorageId,
}: GeneratePlanProps) {
    // 获取行程 Id
    const planId = await fetchMutation(
        api.travelplan.createPlan,
        {
            planTitle,
            travelPlace,
            fromDate,
            toDate,
            noOfDays,
            travelPersons,
            travelType,
            budget,
            imageURL,
            imageStorageId,
            isGeneratedUsingAI: true,
        },
    );

    console.log(`generate new plan by ${planId}`);

    if (planId === null) return null;

    // fetchMutation(
    //     api.retrier.runAction,
    //     {
    //         action: "images:generateAndStore",
    //         actionArgs: {
    //             prompt: placeName,
    //             planId: planId,
    //         },
    //     },
    // );
    
    // 调用大模型生成函数
    const prepare1 = useAction(api.travelplan.prepareBatch1);
    await prepare1({planId: planId});

    const prepare2 = useAction(api.travelplan.prepareBatch2);
    await prepare2({planId: planId});

    const prepare3 = useAction(api.travelplan.prepareBatch3);
    await prepare3({planId: planId});
    
    // 跳转页面
    redirect(`/plans/${planId}/plan?isNewPlan=true`);
}