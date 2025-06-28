import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

// 处理聊天请求并与 Convex 后端进行交互

// 动态方式处理请求
export const dynamic = "force-dynamic";

// 初始化 Convex 客户端，确保设置了环境变量
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const client = new ConvexHttpClient(convexUrl);

export async function POST(req: Request) {
  try {
    // 接收请求对象，解析请求体中的字段：messages、chatId、model
    const { messages, chatId } = await req.json();

    // 打印调试信息
    console.log("Number of messages:", messages.length);
    console.log("Chat ID:", chatId);

    // 如果缺少 chatId，返回 400 错误
    if (!chatId) {
      console.error("Missing chatId in request, 请求中缺少 chatId");
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    // 调用 convex 端的 chat 功能，将消息和 chatId 发送到后端
    // 后端自动处理并保存响应到数据库
    await client.action(api.multiModelAI.chat, {
      messages,
      chatId,
    });

    // 打印成功调用的信息
    console.log("Convex action api.multiModelAI.chat triggered successfully.");

    // 返回成功响应
    return NextResponse.json({ success: true });

  } catch (error: any) {
    // 打印错误信息
    console.error("Error in /api/chat route:", error);

    // 生成详细的错误信息
    let errorMessage = "Failed to process chat request.";
    if (error.message) {
      errorMessage += ` Error: ${error.message}`;
    }

    // 返回错误响应
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}