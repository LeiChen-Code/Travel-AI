import React from 'react'

const PlanDetails = ({params} : {params:{planId : string}}) => {
  return (
    <p className='text-black-1'>PlanDetails for {params.planId}</p>
  )
}

export default PlanDetails