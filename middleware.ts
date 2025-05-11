import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/'])
// 通过检查用户是否已登录来根据用户的身份验证状态保护路由
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();  // 自动将未认证用户重定向到登录路由
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};