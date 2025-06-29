"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";
import { internal } from "./_generated/api";


// 大模型角色定位提示词
const SYSTEM_PROMPT = `
你是一个专业的旅行规划助手，具备以下核心能力：
1. 角色定位
   - 你是资深旅行规划师+本地生活专家+行程优化师，结合用户需求与实时数据提供个性化方案。

2. 功能范围
   - 目的地推荐：根据预算、季节、兴趣（如亲子/蜜月/探险）、旅行时长推荐3-5个目的地，附推荐理由（如"11月北京红叶最佳，适合摄影爱好者"）。
   - 行程优化：按用户指定城市生成每日路线，标注交通方式（如地铁/打车）、时间分配（如"上午故宫3小时+下午天安门广场2小时"）、错峰建议（如"避开故宫周一闭馆，调整至第三日"）。
   - 预算规划：提供低/中/高三种消费方案（如经济型：青旅+公交卡；高端：专车接送+米其林餐厅）。
   - 小众玩法：推荐本地人私藏景点（如"京都鸭川边的百年豆腐店"）、特色活动（如"曼谷周末夜市砍价攻略"）。
   - 应急预案：天气突变备选方案（如"巴黎下雨改去卢浮宫+地下酒窖参观"）、证件丢失处理指南。

3. 交互逻辑
   - 主动询问关键参数：  
     "请问您的出发城市、旅行天数、预算范围、主要兴趣（如美食/历史遗迹/户外）？是否有老人或儿童同行？"
   - 分层输出：先给大纲（如城市选择→每日行程→预算），再逐步细化。
   - 数据支撑：引用权威来源（如"根据Lonely Planet 2024推荐"）或实时数据（如"当前马尔代夫机票价格监测"）。

4. 注意事项  
   - 避免主观偏好："不默认推荐网红景点，优先考虑实际体验度"。
   - 文化敏感：标注禁忌（如"清真寺需着长裤"）、节日影响（如"印度排灯节期间交通混乱"）。
   - 可行性验证：检查景点开放时间冲突（如"大英博物馆闭馆日为周日"）。
`;

// 检查环境变量并打印
console.log("Environment Variables Status:");
console.log(`DASHSCOPE_API_KEY: ${process.env.DASHSCOPE_API_KEY ? "Set ✓" : "Not set ✗"}`);

// 初始化 openai 客户端实例，先判断 API key 是否存在
let openai: OpenAI | null = null;
try {
  if (process.env.DASHSCOPE_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
    console.log("OpenAI client initialized successfully");
  } else {
    console.log("OpenAI API key not found. Client not initialized.");
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}


// 实现聊天功能，并把模型回复保存到数据库
export const chat = action({
  args: {
    messages: v.array(
      v.object({
        content: v.string(),
        role: v.string(),
      })
    ),
    chatId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    
    // 打印参数
    console.log("[multiModelAI.chat] Action started.");
    console.log(`[multiModelAI.chat] Received args: ${JSON.stringify(args, null, 2)}`);

    // 使用的模型 qwen-plus
    const modelToUse = "qwen-plus"; 
    console.log(`[multiModelAI.chat] Processing request for model: ${modelToUse}`);

    try {
      console.log("[multiModelAI.chat] Entering try block.");

      // !添加系统 prompt 到消息数组的最前面，定义模型的角色和行为逻辑
      const messagesWithSystemPrompt = [
        { role: "system", content: SYSTEM_PROMPT },
        ...args.messages,
      ];
     
      console.log("[multiModelAI.chat] Prepared messages with system prompt.");

      // 将消息格式化为 OpenAI API 期望的结构
      const adaptedMessages = messagesWithSystemPrompt.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      }));

      console.log("[multiModelAI.chat] Adapted messages for API call.");

      // 检查环境变量是否已经配置
      const requiredEnvKey = "DASHSCOPE_API_KEY"; 
      console.log(`[multiModelAI.chat] Checking required env key: ${requiredEnvKey}`);

      if (!process.env[requiredEnvKey]) {
        console.error(
          `[multiModelAI.chat] ERROR: The required environment variable ${requiredEnvKey} is not set. Using fallback response.`
        );
        console.log("[multiModelAI.chat] Returning fallback due to missing env var.");
        // 如果未配置环境变量，返回带有错误说明的消息
        return {
          role: "assistant" as const,
          content: `您好，很抱歉，当前无法处理您的请求，因为环境变量 ${requiredEnvKey} 尚未设置。请在 Convex 部署设置中正确配置该环境变量后再试。`,
        };
      }
      
      console.log(`[multiModelAI.chat] Env key ${requiredEnvKey} is present.`);

      // !调用大模型，获取大模型回复
      console.log("[multiModelAI.chat] Calling OpenAI handler");
      const response = await handleOpenAI(adaptedMessages);

      console.log(`[multiModelAI.chat] Response received from ${modelToUse} handler.`);

      // ! 将 AI 回复保存到数据库中
      if (args.chatId && response?.content) {
        console.log(`[multiModelAI.chat] Saving response for chatId: ${args.chatId}`);
    
        await ctx.runMutation(internal.messages.saveAIResponse, {
          chatId: args.chatId,
          role: "assistant",
          content: response.content,
          text: response.content,
          complete: true,
        });
        console.log(
          `[multiModelAI.chat] Saved AI response for chat ${args.chatId} using model ${modelToUse}`
        );
      } else if (args.chatId) {
        console.error(
          "[multiModelAI.chat] ERROR: AI response content was null or empty, not saving."
        );
      } else {
        console.log("[multiModelAI.chat] No chatId provided, response not saved to DB.");
      }
      
      console.log("[multiModelAI.chat] Returning response from action.");
      
      return response;

    } catch (error: any) {
      // 打印错误说明
      console.error("[multiModelAI.chat] CRITICAL ERROR in action handler:", error);
      console.error(`[multiModelAI.chat] Error Name: ${error.name}`);
      console.error(`[multiModelAI.chat] Error Message: ${error.message}`);
      console.error(`[multiModelAI.chat] Error Stack: ${error.stack}`);

      // 生成一个报错反馈，包含错误信息
      const fallbackResponse = {
        role: "assistant",
        content: `您好！很抱歉，使用 ${modelToUse} 处理您的请求时遇到错误。请联系管理员并查看服务器日志获取详细信息。错误详情：${error.message}`, 
      };

      // 保存错误反馈消息
      if (args.chatId) {
        try {
          await ctx.runMutation(internal.messages.saveAIResponse, {
            chatId: args.chatId,
            role: "assistant",
            content: fallbackResponse.content,
            text: fallbackResponse.content,
            complete: true,
          });
          console.log(`[multiModelAI.chat] Saved fallback AI response for chat ${args.chatId}`);
        } catch (saveError: any) {
          console.error(
            `[multiModelAI.chat] FAILED TO SAVE FALLBACK RESPONSE for chat ${args.chatId}:`,
            saveError
          );
        }
      }
      // --- START ADDED LOGGING ---
      console.log("[multiModelAI.chat] Returning fallback response due to error.");
      // --- END ADDED LOGGING ---
      return fallbackResponse; // 返回错误反馈
    }
  },
});

// 调用大模型并获取回复
async function handleOpenAI(messages: Array<{ role: string; content: string }>) {
  
  if (!openai) {
    console.error("OpenAI client is not initialized. Check your API key.");
    return {
      role: "assistant" as const,
      content:
        "您好！很抱歉，当前无法处理您的请求，因为 OpenAI API Key 未正确配置。请在 Convex 控制台设置 OPENAI_API_KEY 环境变量后重试。",
    };
  }

  console.log("Calling OpenAI API with messages:", messages);

  try {

    // 调用通义千问
    const response = await openai.chat.completions.create({
        model: "qwen-plus",  //可按需更换模型名称。
        messages: messages as any,
        //stream: true,  // 流式输出
    });

    console.log("AI response:", response.choices[0].message);
    // 返回 AI 回复
    return response.choices[0].message;

  } catch (error) {
    // 打印错误信息
    console.error("OpenAI API error:", error);
    return {
      role: "assistant" as const,
      content:
        "您好！很抱歉处理您的请求时遇到错误。请检查您的 OpenAI API Key 是否有效且余额充足。如有疑问请联系管理员。",
    };
  }
}