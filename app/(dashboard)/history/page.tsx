"use client"
import CreatePlan from '@/components/CreatePlan'
import SearchContent from '@/components/SearchContent'
import TravelCard from '@/components/TravelCard'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React from 'react'

const HistoryPlan = () => {

  const historyPlans = useQuery(api.travelplan.getHistoryPlan)

  return (
    <div className='flex flex-col gap-6'>
      <header className='w-full flex gap-4 items-center justify-start px-6 py-3 border-b border-gray-200 bg-white'>
        <h1 className='text-20 font-bold text-black-1'>行程记录</h1>
        <div className='flex gap-3'>
          {/* 搜索行程 */}
          <SearchContent/>
        </div>
      </header>
        {/* 行程卡片 */}
      <section className='flex flex-col gap-5'>
        <div className='travel_grid'>
          {historyPlans?.map(({_id, planTitle, fromDate, toDate, imageURL}) => (
            <TravelCard
              key={_id}
              imgURL={imageURL}
              title={planTitle}
              fromDate={fromDate}
              toDate={toDate}
            />
          ))}
        </div>
        
      </section>

    </div>
  )
}

export default HistoryPlan