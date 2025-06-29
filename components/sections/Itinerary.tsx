import Timeline from "@/components/Timeline";
import SectionWrapper from "@/components/sections/SectionWrapper";
import {AddIternaryDay} from "@/components/addNewItineraryDay/AddItineraryDay";
import {Skeleton} from "@/components/ui/skeleton";
import {Navigation, PlusCircle, PlusCircleIcon, PlusIcon} from "lucide-react";
import { ItineraryProps } from "@/types";

// 此组件实现行程表

const Itinerary = ({itinerary, planId, isLoading, allowEdit}: ItineraryProps) => {
  return (
    <SectionWrapper id="itinerary">
      {/* header */}
      <div className="mb-2 flex justify-between items-center">
        {/* 标题 */}
        <h2
          className="text-lg font-medium
                tracking-wide flex items-center"
        >
          <Navigation className="w-5 h-5 mr-2" /> 行程表
        </h2>
        {/* 编辑按钮 */}
        {allowEdit && !isLoading && <AddIternaryDay planId={planId} />}
      </div>

      {/* 行程内容 */}
      {!isLoading ? (
        // 加载完毕以后显示时间线
        <Timeline itinerary={itinerary} planId={planId} allowEdit={allowEdit}/>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
};

export default Itinerary;