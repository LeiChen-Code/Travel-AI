"use client";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {PlusCircleIcon} from "lucide-react";

import ItineraryDayForm from "@/components/addNewItineraryDay/ItineraryDayForm";


// 此组件定义 新增一天 按钮
export function AddIternaryDay({planId}: {planId: string}) {
  // 定义对话框是否打开
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          {/* icon */}
          <PlusCircleIcon className="h-5 w-5" />
          <span>新增一天</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <ItineraryDayForm planId={planId} setOpen={setOpen} />
      </DialogContent>
      
    </Dialog>
  );
}