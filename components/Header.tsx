import React from 'react'
import Link from 'next/link'

// 顶部栏
const Header = () => {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link href="/" className="flex items-center space-x-2">
        <img src="/icons/logo.svg" alt="智行派 Logo" className="h-8 w-8" />
        <span className="text-xl font-semibold">智行派</span>
      </Link>
    </header>
  )
}

export default Header