"use client"
import NewPlanForm from '@/components/create/NewPlanForm'
import React from 'react'

// 此页面呈现填写行程需求表单的功能

const createPlan = () => {
  return (
    <section className="flex flex-col px-10 mb-10">
        <NewPlanForm/>
    </section>
  )
}

export default createPlan