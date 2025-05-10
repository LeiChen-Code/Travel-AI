'use client';

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const LeftSidebar = () => {

    const pathname = usePathname();  // 来自导航栏的路径
    const router = useRouter();  // 来自路由的路径

    return (
        <section className='left_sidebar'>
            <nav className='flex flex-col gap-6 '>
                {sidebarLinks.map(({route, label, imgURL}) => {
                    const isActive = pathname ===  route || pathname.startsWith(`${route}/`);

                    return <Link href={route} key={label} className={cn(
                        "flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start hover:bg-nav-focus",
                        {
                            'bg-nav-focus border-r-4 border-blue-1':isActive
                        })}>
                        
                        <Image
                            src={imgURL}
                            alt={label}
                            width={24}
                            height={24}
                        />
                        <p>{label}</p>
                    </Link>
                })}

            </nav>

        </section>
    )
}

export default LeftSidebar