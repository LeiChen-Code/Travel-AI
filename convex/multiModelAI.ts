"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";
import { VALID_MODELS } from "./modelPreferences";
import { internal } from "./_generated/api";

// System prompt for AI models
const SYSTEM_PROMPT = `
Hi, let's chat about the weather!"

Your job is to:

Provide accurate, up-to-date weather information

Explain weather conditions in simple, clear language

Help users plan their day or week based on the forecast

Offer tips based on the weather (e.g., what to wear, travel advice)

Keep the conversation light, helpful, and easy to understand

Your tone is warm, conversational, and informative. Avoid jargon unless explaining it clearly. Always focus on making weather info feel useful and approachable.
`;

// Check environment variables and log their status
console.log("Environment Variables Status:");
console.log(`DASHSCOPE_API_KEY: ${process.env.DASHSCOPE_API_KEY ? "Set ✓" : "Not set ✗"}`);

// Initialize OpenAI client if API key is present
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

// Multi-model chat function
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
    
    console.log("[multiModelAI.chat] Action started.");
    console.log(`[multiModelAI.chat] Received args: ${JSON.stringify(args, null, 2)}`);

    // 使用的模型 qwen-plus
    const modelToUse = "qwen-plus"; 
    console.log(`[multiModelAI.chat] Processing request for model: ${modelToUse}`);

    try {
      console.log("[multiModelAI.chat] Entering try block.");

      // 添加系统 prompt 到消息数组的最前面
      const messagesWithSystemPrompt = [
        //{ role: "system", content: SYSTEM_PROMPT },
        ...args.messages,
      ];
     
      console.log("[multiModelAI.chat] Prepared messages with system prompt.");

      // 将消息格式化为 Open AI API 期望的结构
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
          content: `Hi there

I apologize, but I cannot process your request right now because the ${requiredEnvKey} environment variable is not set. Please configure this in your Convex deployment settings.`,
        };
      }
      
      console.log(`[multiModelAI.chat] Env key ${requiredEnvKey} is present.`);

      // 调用大模型
      console.log("[multiModelAI.chat] Calling OpenAI handler");
      const response = await handleOpenAI(adaptedMessages);

      console.log(`[multiModelAI.chat] Response received from ${modelToUse} handler.`);

      // 收到回复后，如果传入了 chatId，且回复内容不为空，将 AI 回复保存到数据库中
      if (args.chatId && response?.content) {
        console.log(`[multiModelAI.chat] Saving response for chatId: ${args.chatId}`);
    
        await ctx.runMutation(internal.directMessages.saveAIResponse, {
          chatId: args.chatId,
          role: "assistant",
          content: response.content,
          text: response.content,
          complete: true,
          modelPreference: modelToUse, // Save 'openai' as preference
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
      // Catch specific error type
      console.error("[multiModelAI.chat] CRITICAL ERROR in action handler:", error);
      console.error(`[multiModelAI.chat] Error Name: ${error.name}`);
      console.error(`[multiModelAI.chat] Error Message: ${error.message}`);
      console.error(`[multiModelAI.chat] Error Stack: ${error.stack}`);

      // Generate a fallback response if there's an error
      const fallbackResponse = {
        role: "assistant",
        content: `Hi there

I'm sorry, I encountered an error while processing your request with ${modelToUse}. Please check the server logs for details. Error: ${error.message}`, // Include error message
      };

      // Save the fallback response if we have a chatId
      if (args.chatId) {
        try {
          await ctx.runMutation(internal.directMessages.saveAIResponse, {
            chatId: args.chatId,
            role: "assistant",
            content: fallbackResponse.content,
            text: fallbackResponse.content,
            complete: true,
            modelPreference: modelToUse, // Save 'openai' as preference
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
      return fallbackResponse; // Return fallback even if save fails
    }
  },
});

// OpenAI handler
async function handleOpenAI(messages: Array<{ role: string; content: string }>) {
  if (!openai) {
    console.error("OpenAI client is not initialized. Check your API key.");
    return {
      role: "assistant" as const,
      content:
        "Hi there\n\nI apologize, but I'm unable to process your request right now. The OpenAI API key is not configured correctly. Please set the OPENAI_API_KEY environment variable in the Convex dashboard.",
    };
  }

  console.log("Calling OpenAI API with messages:", messages);

  try {
    // Cast the messages to the type OpenAI expects
    // const response = await openai.chat.completions.create({
    //   messages: messages as any,
    //   model: "gpt-3.5-turbo",
    // });

    const response = await openai.chat.completions.create({
        model: "qwen-plus",  //可按需更换模型名称。
        messages: messages as any,
        //stream: true,  // 流式输出
    });

    console.log("OpenAI API response:", response.choices[0].message);
    return response.choices[0].message;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      role: "assistant" as const,
      content:
        "Hi there\n\nI apologize, but I encountered an error while processing your request. Please check that your OpenAI API key is valid and has sufficient credits.",
    };
  }
}