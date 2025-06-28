// 该文件定义网络 webhook 调用
// 通常使用 webhooks 接收来自外部应用程序(如 Clerk)的数据
// 让我们的应用可以和其他服务通信

// 流程：创建一个 clerk 用户 -> clerk 发送用户信息 -> 调用 users.create -> 把用户信息加入数据库

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";  // npm install svix

const handleClerkWebhook = httpAction(async (ctx, request) => {
    // 该 webhook 将在通过 clerk 的登录界面验证用户后调用
    const event = await validateRequest(request);
    if (!event) {
        console.log("无法验证 Clerk webhook 请求");
        return new Response("Error occured", {
        status: 400,
        });
    }
    
    console.log("Received Clerk event:", event.type, event.data.id);
    switch (event.type) {
        case "user.created":  // 完成验证后将调用 createUser 函数
            await ctx.runMutation(internal.users.createUser, {
                clerkId: event.data.id,
                email: event.data.email_addresses[0].email_address,
                imageUrl: event.data.image_url,
                userName: event.data?.username ?? "",  // event.data.username 可能为空，因为要设置一个默认值""
            });
            break;
        case "user.updated":
            await ctx.runMutation(internal.users.updateUser, {
                clerkId: event.data.id,
                imageUrl: event.data.image_url,
                email: event.data.email_addresses[0].email_address,
                userName: event.data?.username ?? "", 
            });
            break;
        case "user.deleted":
            await ctx.runMutation(internal.users.deleteUser, {
                clerkId: event.data.id as string,
            });
            break;
    }
    
    return new Response(null, {
        status: 200,
    });
});

// 当客户端发送一个 POST 请求到 /clerk 时，Convex 会自动调用 handleClerkWebhook 函数
const http = httpRouter();
http.route({
  path: "/clerk",  // 注意这里 path 是 /clerk，因为要在 URL 后面跟上 /clerk
  method: "POST",
  handler: handleClerkWebhook,
});

// 验证请求
const validateRequest = async (
    req: Request
  ): Promise<WebhookEvent | undefined> => {
    // ! 申请 cleark 的 webhook secret
    // 获取 CLERK_WEBHOOK_SECRET 环境变量的值，用于验证 Webhook 请求签名的密钥
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }
    const payloadString = await req.text();
    const headerPayload = req.headers;
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    };
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
  };

export default http;