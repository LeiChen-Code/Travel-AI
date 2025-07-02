"use client"
import TravelCard from '@/components/TravelCard'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Search } from 'lucide-react'
import React, { ChangeEvent, useState } from 'react'

const HistoryPlan = () => {

  // 获取用户的所有行程
  const historyPlans = useQuery(api.travelplan.getHistoryPlan)
  // 获取用户的输入
  const [searchPlanText, setSearchPlanText] = useState("");
  // 获取根据用户搜索过滤后的行程
  const [filteredPlans, setFilteredPlans] = useState<typeof historyPlans>();
  // 最终的行程数据
  const finalPlans = filteredPlans ?? historyPlans;

  // 定义搜索行程的方法
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    // 获取输入
    const value = e.target.value;
    setSearchPlanText(value);  // 设置用户输入
    // 历史行程为空，直接返回
    if (!historyPlans || !historyPlans.length) {
      return;
    }
    // 输入为空，过滤数据也为空
    if (!value) {
      setFilteredPlans(undefined);
      return;
    }
    // 调用 filter 方法遍历每一个行程 plan 对象，判断该对象的 travelPlace 字段是否包含用户的输入
    const filteredResults = historyPlans.filter((plan) => {
      return plan.travelPlace.toLowerCase().includes(value.toLowerCase());
    });
    // 设置过滤结果
    setFilteredPlans(filteredResults);
  };

  return (
    <div className='flex flex-col gap-6'>
      <header className='w-full flex gap-4 items-center justify-start px-6 py-3 border-b border-gray-200 bg-white'>
        <h1 className='text-20 font-bold text-black-1 px-4'>行程记录</h1>
        <div className='relative ml-auto flex-1'>
          {/* 搜索行程 */}
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
          <Input 
              id="searchPlan"
              type="search" 
              placeholder="搜索行程"
              onChange={handleSearch}
              value={searchPlanText}
              className="w-full cursor-pointer bg-background pl-8 transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              disabled={!historyPlans || !historyPlans.length}
          />
        </div>
      </header>
        {/* 行程卡片 */}
      <section className='flex flex-col gap-5 px-10'>
        <div className='travel_grid'>
          {finalPlans?.map(({_id, planTitle, fromDate, toDate, imageURL, planId}) => (
            <TravelCard
              key={_id}
              imgURL={imageURL}
              title={planTitle}
              fromDate={fromDate}
              toDate={toDate}
              planId={planId}
            />
          ))}
        </div>
        
      </section>

    </div>
  )
}

export default HistoryPlan