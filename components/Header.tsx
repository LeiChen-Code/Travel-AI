"use client";
import React from 'react'
import Link from 'next/link'
import { UserButton } from "@clerk/nextjs";

// 顶部栏
const Header = () => {
  return (
    <header className="w-full flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-white">
      <Link href="/create" className="flex items-center space-x-2">
        <img src="/icons/logo.svg" alt="智行派 Logo" className="h-8 w-8" />
        <span className="text-xl font-semibold">智行派</span>
      </Link>
      <UserButton />
    </header>
  )
}

export default Header