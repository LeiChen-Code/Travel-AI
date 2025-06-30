import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Loader} from "lucide-react";

// 此组件提示用户等待AI生成

const AlertForAI = ({show}: {show: boolean}) => {
  if (!show) return null;
  return (
    <Alert className="px-2 py-4 border-b border-gray-100">
      <Loader className="h-4 w-4 animate-spin" />
      <AlertTitle className="font-semibold tracking-wide text-blue-1">
        旅行计划正在生成！
      </AlertTitle>
      <AlertDescription>
        人工智能正在精心为您定制旅行计划，请耐心等待 1-3 分钟...
      </AlertDescription>
    </Alert>
  );
};

export default AlertForAI;