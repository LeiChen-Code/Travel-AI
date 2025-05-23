"use client";
import SectionWrapper from "@/components/sections/SectionWrapper";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import {Skeleton} from "@/components/ui/skeleton";
import {api} from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BestTimeToVisitProps } from "@/types";
import {useMutation} from "convex/react";
import {Clock3} from "lucide-react";
import {useState} from "react";

export default function BestTimeToVisit({
  content,
  isLoading,
  planId,
  allowEdit,
}: BestTimeToVisitProps) {

  const [editMode, setEditMode] = useState(false);  // 是否允许编辑
  const updateBestTimeToVisit = useMutation(api.travelplan.updatePartOfPlan);  // 更新数据库信息

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateBestTimeToVisitContent = (updatedContent: string) => {
    updateBestTimeToVisit({
      planId: planId as Id<"planDetails">,
      data: updatedContent.trim(),
      key: "besttimetovisit",
    }).then(() => {
      handleToggleEditMode();
    });
  };

  return (
    <SectionWrapper id="besttimetovisit">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof content === "string" && content.length > 0}
        icon={<Clock3 className="mr-2 w-5 h-5" />}
        title="最佳旅行时间"
        isLoading={isLoading}
      />
      <div className="ml-8">
        {!isLoading ? (
          editMode ? (
            <EditText
              content={content ?? ""}
              toggleEditMode={handleToggleEditMode}
              updateContent={updateBestTimeToVisitContent}
            />
          ) : (
            content || (
              <div className=" flex justify-center items-center">
                点击 + 添加最佳旅行时间
              </div>
            )
          )
        ) : (
          <Skeleton className="w-full h-full" />
        )}
      </div>
    </SectionWrapper>
  );
}