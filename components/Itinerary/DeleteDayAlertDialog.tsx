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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

// 定义删除操作方法
type DeleteDayAlertDialogProps = {
  onConfirm: () => void;
};

export default function DeleteDayAlertDialog({ onConfirm }: DeleteDayAlertDialogProps) {
  const [open, setOpen] = useState(false); // 定义是否弹出对话窗口

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="w-7 h-7 p-1 rounded-full"
          onClick={() => setOpen(true)}
        >
          <TrashIcon className="text-red-500 hover:scale-105 transition-all duration-300" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white-1">
        <AlertDialogHeader>
          <AlertDialogTitle>请确认你的操作</AlertDialogTitle>
          <AlertDialogDescription>
            此操作无法撤销。这将从您的行程中永久删除这一天。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            className="text-white-1"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}