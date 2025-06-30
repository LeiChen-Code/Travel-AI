"use client";

import {api} from "@/convex/_generated/api";
import {useMutation} from "convex/react";
import {Id} from "../../convex/_generated/dataModel";
import { ItineraryDayHeaderProps } from "@/types";
import DeleteDayAlertDialog from "./DeleteDayAlertDialog";
import { EditIternaryDay } from "./EditItineraryDay";

// 此组件定义行程表中的一天的 header

export default function ItineraryDayHeader({title, planId, allowEdit, itineraryDay}: ItineraryDayHeaderProps) {
  // 从接口定义删除行程表某一天的函数
  const deleteDayInItinerary = useMutation(api.travelplan.deleteDayInItinerary);

  // 查询行程数据，根据 title 查询到 itineraryDay


  return (
    <div className="flex justify-between mb-2 text-base font-medium leading-2 text-foreground ">
      {/* 标题 */}
      <span className="text-black-1">{title}</span>
 
      {allowEdit && (
        <div className="flex gap-2">
          {/* 编辑按钮 */}
          <EditIternaryDay planId={planId} itineraryDay={itineraryDay} />

          {/* 删除按钮 */}
          <DeleteDayAlertDialog
            onConfirm={() => 
              deleteDayInItinerary({planId: planId as Id<"planDetails">, dayName: title})
            }
          />
        </div>

      )}
    </div>
  );
}