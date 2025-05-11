import Image from 'next/image'
import React from 'react'

const TravelCard = ({
    imgURL, title, date, travelId
}:{
    imgURL: string,
    title: string,
    date: string,
    travelId: number,
}) => {
  return (
    <div className='cursor-pointer'>
        <figure className='flex flex-col gap-2'>
            <div className='relative overflow-hidden rounded-md aspect-square w-56 bg-gray-100'>
                <Image
                src={imgURL}
                width={200}
                height={200}
                alt={title}
                className='object-cover absolute w-full h-full'
                />
            </div>
            
            <div className='flex flex-col'>
                <h1 className='text-16 truncate font-bold text-black-1'>
                    {title}
                </h1>
                <h2 className='text-12 truncate font-normal capitalize text-black-1 mt-1'>
                    {date}
                </h2>
            </div>
        </figure>
    </div>
  )
}

export default TravelCard