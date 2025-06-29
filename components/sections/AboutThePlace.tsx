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
  
  const [editMode, setEditMode] = useState(false);  // editMode 表示是否允许编辑，初始不允许编辑
  const updateAboutThePlace = useMutation(api.travelplan.updatePartOfPlan);  // 表示更新地点信息

  // 切换编辑模式状态
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  // 用户编辑内容并提交
  const updateAboutThePlaceContent = (updatedContent: string) => {
    updateAboutThePlace({
      planId: planId as Id<"planDetails">,
      data: updatedContent.trim(),
      key: "abouttheplace",  // key 指定要更新的字段
    }).then(() => {
      handleToggleEditMode();  // 当内容生成后，切换编辑模式
    });
  };

  return (
    <SectionWrapper id="abouttheplace">
      {/* 标题 header */}
      <HeaderWithEditIcon
        shouldShowEditIcon={!editMode && allowEdit}
        handleToggleEditMode={handleToggleEditMode}
        hasData={typeof content === "string" && content.length > 0}
        icon={<Info className="mr-2 w-5 h-5"/>}
        title="目的地介绍"
        isLoading={isLoading}
      />

      {/* 内容 */}
      <div className="ml-8">
        {!isLoading ? (
          editMode ? (
            // 如果处于编辑模式，显示百年祭组件
            <EditText
              content={content ?? ""}
              toggleEditMode={handleToggleEditMode}
              updateContent={updateAboutThePlaceContent}
            />
          ) : (
            // 如果不处于编辑模式，显示内容；如果内容为空，提示添加操作
            content || (
              <div className=" flex justify-center items-center">
                点击 + 添加地点
              </div>
            )
          )
        ) : (
          // 如果正在加载，显示 skeleton
          <Skeleton className="w-full h-full" />
        )}
      </div>
    </SectionWrapper>
  );
}