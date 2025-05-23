"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import React from 'react'
import MapContainer from '@/components/MapContainer';
import { Chat } from '@/components/chat/chat';
import Plan from '@/components/travelplan/plan';

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

  return (
    <div>
      {/* 页面分为三部分 */}
      <ResizablePanelGroup
        direction="horizontal"
        className='h-screen w-full'
      >
        {/* 左边 */}
        <ResizablePanel defaultSize={50} minSize={20} className='h-screen border'>
          <div className="h-full w-full overflow-auto flex items-center justify-center">
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
                <MapContainer/>
              </div>
            </ResizablePanel>

            <ResizableHandle />
            {/* 右下：聊天框 */}
            <ResizablePanel defaultSize={50} minSize={30} className='border'>
              <div className="flex h-full items-center justify-center">
                {/* 聊天组件 */}
                <Chat />
              </div>
            </ResizablePanel>

          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
    
  )
}

export default PlanDetails