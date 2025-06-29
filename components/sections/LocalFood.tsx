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
  recommendations,  // 食物列表
  isLoading,
  planId,
  allowEdit,
}: LocalFoodProps) {
  // 设置编辑状态
  const [editMode, setEditMode] = useState(false);

  const updateLocalFood = useMutation(api.travelplan.updatePartOfPlan);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // 更新食物推荐表单
  const updateLocalFoodContent = (updatedArray: string[]) => {
    updateLocalFood({
      planId: planId as Id<"planDetails">,
      data: updatedArray,
      key: "localfood",
    }).then(() => {
      handleToggleEditMode();  // 更新完后切换编辑状态
    });
  };

  return (
    <SectionWrapper id="localfood">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={recommendations != null && recommendations.length != 0}
        icon={<Utensils className="mr-2 w-5 h-5" />}
        title="当地美食推荐"
        isLoading={isLoading}
      />

      {!isLoading && recommendations ? (
        <div className="ml-8">
          {editMode ? (
            // 编辑表单
            <EditList
              arrayData={recommendations}
              handleToggleEditMode={handleToggleEditMode}
              updateData={updateLocalFoodContent}
            />
          ) : (
            // 传入食物列表
            <List list={recommendations} />
          )}
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
}