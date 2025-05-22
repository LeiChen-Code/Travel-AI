import { TravelCardProps } from '@/types';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React from 'react'

const TravelCard = ({
    imgURL, title, fromDate, toDate, planId
}: TravelCardProps) => {
    
    // 将时间戳转换为日期字符串
    const from = new Date(fromDate).toLocaleDateString();
    const to = new Date(toDate).toLocaleDateString();

    const router = useRouter();

    // 点击行程卡片，应该导航到 行程规划详情页
    const handleCard = () => {
        // 使用路由
        router.push(`/plans/${planId}`, {
            scroll: true
        })
    }


    return (
        // onClick 表示点击事件，点击触发 handleCard
        <div className='cursor-pointer' onClick={handleCard}>
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
                        {from}-{to}
                    </h2>
                </div>
            </figure>
        </div>
    )
}

export default TravelCard