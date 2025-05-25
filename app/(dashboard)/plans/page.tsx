"use client"
import React from 'react'

type Location = {
  name: string;
  position: [number, number];
};


const CreatPlan = () => {

  // 示例地点列表
  const locations: Location[] = [
    {
      name: '故宫博物院',
      position: [116.403972, 39.924091],
    },
    {
      name: '八达岭长城',
      position: [116.024039, 40.366178],
    },
    {
      name: '颐和园',
      position: [116.277118, 39.993439],
    },
  ];


  return (
    <div>
      <h1 className='text-20 font-bold text-black-1'>地图示例</h1>
      {/* <Map locations={locations}/> */}
    </div>
  )
}

export default CreatPlan