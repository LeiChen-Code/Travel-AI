"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const Home = () => {

  const router = useRouter();

  // 点击登录按钮，应该导航到 登录页
  const SignIn = () => {
      // 使用路由
      router.push(`/sign-in`, {
          scroll: true
      })
  }

  // 点击注册按钮，应该导航到 注册页
  const SignUp = () => {
      // 使用路由
      router.push(`/sign-up`, {
          scroll: true
      })
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* 主容器 */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-screen-lg">
        {/* 左侧图片区域 */}
        <div className="w-full md:w-3/5 grid grid-cols-2 gap-4">
          <Image
            src="/images/cover-1.png" 
            alt="旅行插画 1" 
            width={500}
            height={500}
            className="w-full h-auto" 
          />
          <Image
            src="/images/cover-2.png" 
            alt="旅行插画 2" 
            width={500}
            height={500}
            className="w-full h-auto" 
          />
        </div>
        {/* 右侧文本区域 */}
        <div className="w-full md:w-2/5 text-center md:text-left p-4">
          <h1 className="text-3xl font-bold mb-4">智行派</h1>
          <h2 className="text-2xl font-bold mb-4 text-blue-1">AI 伴您，旅行由心</h2>
          <p className="mb-4 text-gray-2 leading-relaxed text-justify">
            智行派是一款专注于旅游领域的 AI 助手，为用户提供一站式旅行解决方案。基于专业大模型技术，我们为您生成个性化行程，支持实时调整与智能优化，让旅行规划更轻松、更精准。
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <Button onClick={SignUp} className="bg-blue-500 hover:bg-blue-700 text-white-1 font-medium py-2 px-16 rounded">
              注册
            </Button>
            <Button onClick={SignIn} className="bg-blue-500 hover:bg-blue-700 text-white-1 font-medium py-2 px-16 rounded">
              登录
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home