"use client"
import NewPlanForm from '@/components/NewPlanForm'
import React from 'react'

const createPlan = () => {
  return (
    <section className="flex flex-col px-10 mb-10">
        <NewPlanForm/>
    </section>
  )
}

export default createPlan