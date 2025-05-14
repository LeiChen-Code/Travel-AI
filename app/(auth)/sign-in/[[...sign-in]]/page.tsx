import { SignIn } from '@clerk/nextjs'

const Page = () => {
  return (
    <div className='flex-center glassmorphism-black h-screen w-full'>
        <SignIn forceRedirectUrl="/create"/> 
    </div>
  )
}

export default Page