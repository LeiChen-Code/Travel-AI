import TravelCard from '@/components/TravelCard'
import { travalData } from '@/constants'
import React from 'react'

const HistoryPlan = () => {
  return (
    <div className='mt-2 flex flex-col gap-9'>
      <section className='flex flex-col gap-5'>
        <h1 className='text-20 font-bold text-black-1'>行程记录</h1>

        <div className='travel_grid'>
          {travalData.map(({id, title, date, imgURL}) => (
            <TravelCard
              key={id}
              imgURL={imgURL}
              title={title}
              date={date}
              travelId={id}
            />
          ))}
        </div>
        
      </section>

    </div>
  )
}

export default HistoryPlan