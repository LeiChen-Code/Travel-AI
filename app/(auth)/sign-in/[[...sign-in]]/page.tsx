import { SignIn } from '@clerk/nextjs'

const Page = () => {
  return (
    <div className='flex-center glassmorphism-black h-screen w-full'>
        <SignIn forceRedirectUrl="/history"/> 
    </div>
  )
}

export default Page