import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {Button} from "@/components/ui/button";
import DeletePlanButton from "./DeletePlanButtons";
import { TrashIcon } from "lucide-react";

// 此组件定义删除行程并弹窗的按钮

export default function DeletePlan({planId}: {planId: string}) {
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button 
                variant="ghost"
                size="icon"
                className="rounded-[8px]"
            >
                <TrashIcon className="text-red-500 hover:scale-105 transition-all duration-300" />
            </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-white-1">
            <AlertDialogHeader>
            <AlertDialogTitle>删除行程</AlertDialogTitle>
            <AlertDialogDescription>
                请确认是否删除此行程？删除后将无法恢复，请谨慎操作。
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <DeletePlanButton planId={planId} />
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
