import { SignUp } from '@clerk/nextjs'

const Page = () => {
  return (
    <div className='flex-center glassmorphism-black h-screen w-full'>
        <SignUp forceRedirectUrl="/plans"/>
    </div>
  )
}

export default Page