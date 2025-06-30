"use client";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {PlusCircleIcon} from "lucide-react";

import ItineraryDayForm from "@/components/Itinerary/ItineraryDayForm";


// 此组件定义 编辑一天 按钮
export function EditIternaryDay({planId}: {planId: string}) {
  // 定义对话框是否打开
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white-1 flex gap-2">
          {/* icon */}
          <PlusCircleIcon className="h-6 w-6" />
          <span>编辑一天</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-white-1">
        {/* 编辑表单组件 */}
        <ItineraryDayForm planId={planId} setOpen={setOpen} />
      </DialogContent>
      
    </Dialog>
  );
}