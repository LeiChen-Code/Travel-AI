"use client";

import {Button} from "@/components/ui/button";
import {api} from "@/convex/_generated/api";
import {useMutation} from "convex/react";
import {TrashIcon} from "lucide-react";
import {Id} from "../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";  // 弹出对话框且需要用户响应
import {useState} from "react";
import { ItineraryDayHeaderProps } from "@/types";

// 此组件定义行程表中的一天的 header

export default function ItineraryDayHeader({title, planId, allowEdit}: ItineraryDayHeaderProps) {
  // 从接口定义删除行程表某一天的函数
  const deleteDayInItinerary = useMutation(api.travelplan.deleteDayInItinerary);
  // 定义是否弹出对话窗口
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-between mb-2 text-lg font-bold leading-2 text-foreground ">
      {/* 标题 */}
      <span>{title}</span>

      {allowEdit && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger>
            {/* 删除按钮 */}
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="p-1 rounded-full bg-background/50"
              onClick={() => setOpen(true)}
            >
              <TrashIcon className="h-6 w-6 text-red-500 dark:text-foreground dark:hover:text-red-500 hover:scale-105 transition-all duration-300" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>

            <AlertDialogHeader>
              <AlertDialogTitle>请确认你的操作</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。这将从您的行程中永久删除这一天。
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDayInItinerary({planId: planId as Id<"planDetails">, dayName: title})}
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}