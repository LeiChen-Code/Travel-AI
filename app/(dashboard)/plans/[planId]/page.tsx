"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import React, { useEffect } from 'react'
import { Chat } from '@/components/chat/chat';
import Plan from '@/components/travelplan/plan';
import dynamic from "next/dynamic";
import { MapProvider } from "@/contexts/MapContext";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
// 动态导入
const Map = dynamic(() => import('@/components/map/Map'), {
  ssr: false, // 关闭服务端渲染
});


const PlanDetails = (
  {
    params, 
    searchParams,
  } : 
  {
    params:{planId : string};
    searchParams?: { isNewPlan: string };
  }
) => {

  const { planId } = params;

  const isNewPlan = searchParams && searchParams.isNewPlan
      ? Boolean(searchParams.isNewPlan)
      : false;

  // 调用函数
  const prepare1 = useAction(api.travelplan.prepareBatch1);
  const prepare2 = useAction(api.travelplan.prepareBatch2);
  const prepare3 = useAction(api.travelplan.prepareBatch3);

  // 页面一加载就自动开始 AI 生成行程内容
  useEffect(() => {
    const runAI = async () => {
      try {
        console.log("开始调用 AI");
        await prepare1({ planId });
        await prepare2({ planId });
        await prepare3({ planId });
      } catch (err) {
        console.error("调用 AI 失败", err);
      }
    };
    // 只有新建计划时才会触发AI生成
    if (isNewPlan) {
      runAI();
    }
  }, [planId, isNewPlan])


  return (
    // 使用 MapProvider 包裹 Plan 和 Map 组件，以便它们共享上下文
    <MapProvider>
      <div>
        {/* 页面分为三部分 */}
        <ResizablePanelGroup
          direction="horizontal"
          className='h-screen w-full'
        >
          {/* 左边 */}
          <ResizablePanel defaultSize={50} minSize={20} className='h-screen border'>
            <div className="h-full w-full overflow-auto flex items-center justify-center">
              {/* 展示行程 */}
                <Plan planId={planId} isNewPlan={isNewPlan}/>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* 右边 */}
          <ResizablePanel defaultSize={50} className='h-screen'>
            <ResizablePanelGroup direction="vertical" >
              {/* 右上：地图 */}
              <ResizablePanel defaultSize={50} minSize={30} className='border'>
                <div className="flex h-full items-center justify-center">
                  {/* 展示地图 */}
                  <Map/>
                </div>
              </ResizablePanel>

              <ResizableHandle />
              {/* 右下：聊天框 */}
              <ResizablePanel defaultSize={50} minSize={30} className='border'>
                <div className="flex h-full items-center justify-center">
                  {/* 聊天组件 */}
                  <Chat planId={planId} isNewPlan={isNewPlan}/>
                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </MapProvider>    
  )
}

export default PlanDetails