"use client";

import {Loading} from "@/components/shared/Loading";
import {AlertDialogAction, AlertDialogCancel} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {api} from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {useMutation} from "convex/react";
import {ConvexError} from "convex/values";
import {useRouter} from "next/navigation";
import {useState} from "react";

// 此组件定义确认删除行程的过程

export default function DeletePlanButtons({planId}: {planId: string}) {
  // 获取后端删除行程的接口
  const deletePlan = useMutation(api.travelplan.deletePlan);
  // 路由对象，进行页面跳转
  const router = useRouter();
  // 自定义弹窗通知，用于在删除过程中向用户展示提示信息
  const {toast} = useToast();
  // 判断是否正在删除
  const [isDeleting, setIsDeleting] = useState(false);

  // 处理用户删除行程的操作流程
  const hanleDeletePlan = async () => {
    try {
      setIsDeleting(true);  // 设置删除状态
      const {dismiss} = toast({
        title: "删除行程",
        description: "您的行程正在删除，请稍等...",
      });
      // 删除行程
      await deletePlan({planId});
      dismiss();  // 弹出提示

      router.push("/history");  // 删除后重新跳转到历史行程页面

    } catch (error) {
      if (error instanceof ConvexError) {
        const errorMessage = (error.data as string) ?? "Something went wrong!";
        console.log("删除失败", errorMessage);  // 打印信息
        // 弹窗提示删除失败
        toast({
          title: "删除失败",
          variant: "destructive",
          description: errorMessage,
        });
      }
    }
  };

  return (
    <>
      <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
      <AlertDialogAction asChild className="destructive">
        <Button
          variant="destructive"
          className="bg-red-500 text-white-1 hover:text-white-1 hover:bg-red-700
                    flex gap-2 justify-center items-center"
          disabled={isDeleting}
          onClick={hanleDeletePlan}
        >
          {/* 如果是正在删除，则呈现加载按钮 */}
          {isDeleting && <Loading className="h-4 w-4 text-white" />}
          <span>{isDeleting ? "删除中..." : "确认删除"}</span>
        </Button>
      </AlertDialogAction>
    </>
  );
}