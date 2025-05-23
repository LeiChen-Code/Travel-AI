"use client";
import SectionWrapper from "@/components/sections/SectionWrapper";
import {Skeleton} from "@/components/ui/skeleton";
import {Info} from "lucide-react";
import {useState} from "react";
import EditText from "@/components/shared/EditText";
import HeaderWithEditIcon from "@/components/shared/HeaderWithEditIcon";
import {api} from "@/convex/_generated/api";
import {useMutation} from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { AboutThePlaceProps } from "@/types";


export default function AboutThePlace({content, isLoading, planId, allowEdit}: AboutThePlaceProps) {
  
  const [editMode, setEditMode] = useState(false);  // editMode 表示是否允许编辑
  const updateAboutThePlace = useMutation(api.travelplan.updatePartOfPlan);

  // 切换编辑模式状态
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // 用户编辑内容并提交
  const updateAboutThePlaceContent = (updatedContent: string) => {
    updateAboutThePlace({
      planId: planId as Id<"planDetails">,
      data: updatedContent.trim(),
      key: "abouttheplace",
    }).then(() => {
      handleToggleEditMode();  // 当内容生成后，切换编辑模式
    });
  };

  

  return (
    <SectionWrapper id="abouttheplace">
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof content === "string" && content.length > 0}
        icon={<Info className="mr-2" />}
        title="目的地介绍"
        isLoading={isLoading}
      />
      <div className="ml-8">
        {!isLoading ? (
          editMode ? (
            <EditText
              content={content ?? ""}
              toggleEditMode={handleToggleEditMode}
              updateContent={updateAboutThePlaceContent}
            />
          ) : (
            content || (
              <div className=" flex justify-center items-center">
                点击 + 添加地点
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