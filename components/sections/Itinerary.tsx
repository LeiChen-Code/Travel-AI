import Timeline from "@/components/Timeline";
import SectionWrapper from "@/components/sections/SectionWrapper";
import {AddIternaryDay} from "@/components/addNewItineraryDay/AddItineraryDay";
import {Skeleton} from "@/components/ui/skeleton";
import {Navigation, PlusCircle, PlusCircleIcon, PlusIcon} from "lucide-react";
import { ItineraryProps } from "@/types";

const Itinerary = ({itinerary, planId, isLoading, allowEdit}: ItineraryProps) => {
  return (
    <SectionWrapper id="itinerary">
      <div className="mb-2 flex justify-between items-center">
        <h2
          className="text-base font-medium
                tracking-wide flex items-center"
        >
          <Navigation className="w-5 h-5 mr-2" /> 行程表
        </h2>
        {allowEdit && !isLoading && <AddIternaryDay planId={planId} />}
      </div>
      
      {!isLoading ? (
        <Timeline itinerary={itinerary} planId={planId} allowEdit={allowEdit}/>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
};

export default Itinerary;