"use client";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditList from "@/components/shared/EditList";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import List from "@/components/shared/List";
import {Skeleton} from "@/components/ui/skeleton";
import {api} from "@/convex/_generated/api";
import {Doc, Id} from "@/convex/_generated/dataModel";
import { LocalFoodProps } from "@/types";
import {useMutation} from "convex/react";
import {Utensils} from "lucide-react";
import {useState} from "react";


export default function LocalFoodRecommendations({
  recommendations,
  isLoading,
  planId,
  allowEdit,
}: LocalFoodProps) {
  const [editMode, setEditMode] = useState(false);

  const updateLocalFood = useMutation(api.travelplan.updatePartOfPlan);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateLocalFoodContent = (updatedArray: string[]) => {
    updateLocalFood({
      planId: planId as Id<"planDetails">,
      data: updatedArray,
      key: "localfood",
    }).then(() => {
      handleToggleEditMode();
    });
  };

  return (
    <SectionWrapper id="localfood">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={recommendations != null && recommendations.length != 0}
        icon={<Utensils className="mr-2" />}
        title="当地美食推荐"
        isLoading={isLoading}
      />

      {!isLoading && recommendations ? (
        <div className="ml-8">
          {editMode ? (
            <EditList
              arrayData={recommendations}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateLocalFoodContent}
            />
          ) : (
            <List list={recommendations} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}