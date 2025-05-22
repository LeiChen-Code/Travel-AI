import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Loader} from "lucide-react";

const AlertForAI = ({show}: {show: boolean}) => {
  if (!show) return null;
  return (
    <Alert className="ring-1 ring-yellow-100 shadow-md">
      <Loader className="h-4 w-4 animate-spin" />
      <AlertTitle className="font-semibold tracking-wide text-yellow-700 dark:text-foreground">
        旅行计划正在生成！
      </AlertTitle>
      <AlertDescription>
        人工智能正在精心为您定制旅行计划，请耐心等待 1-3 分钟...
      </AlertDescription>
    </Alert>
  );
};

export default AlertForAI;