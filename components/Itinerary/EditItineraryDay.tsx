"use client";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {PencilIcon, PlusCircleIcon} from "lucide-react";

import ItineraryDayForm, { ItineraryType } from "@/components/Itinerary/ItineraryDayForm";


// 此组件定义 编辑一天 按钮
export function EditIternaryDay({planId, itineraryDay}: {planId: string, itineraryDay: ItineraryType}) {
  // 定义对话框是否打开
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="bg-white-1">
          {/* icon */}
          <PencilIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-white-1 max-h-[80vh] overflow-y-auto">
        {/* 编辑表单组件 */}
        <ItineraryDayForm planId={planId} setOpen={setOpen} initialItinerary={itineraryDay}/>
      </DialogContent>
      
    </Dialog>
  );
}