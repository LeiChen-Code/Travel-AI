import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI(
    {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);


// 封装函数：等待某个异步任务完成
async function pollUntilComplete(taskId: string, apiKey: string, maxAttempts = 10, intervalMs = 3000) {
  const endpoint = "https://dashscope.aliyuncs.com/api/v1/tasks/" + taskId;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const json = await res.json();

    const status = json?.output?.task_status;
    if (status === "SUCCEEDED") return json;
    if (status === "FAILED") throw new Error("任务失败：" + JSON.stringify(json));
    if (status === "CANCELLED") throw new Error("任务被取消");

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempt++;
  }

  throw new Error("任务轮询超时");
}

// 文生图
// API文档：https://bailian.console.aliyun.com/?tab=api#/api/?type=model&url=https%3A%2F%2Fhelp.aliyun.com%2Fdocument_detail%2F2862677.html
export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (_, {prompt}) => {

    const apiKey = process.env.DASHSCOPE_API_KEY!;

    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // 请求内容类型，必须设置为 application/json
        "Authorization": `Bearer ${apiKey}`,
        "X-DashScope-Async": "enable",  // HTTP 请求仅支持异步，必须设置为 enable
      },
      body: JSON.stringify({
        model: "wanx2.1-t2i-turbo",  // 调用通义万象-文生图v2版本
        input: {
          prompt,
        },
        parameters: {
          size: "1024*1024",  // 图片大小
          n: 1,  // 一张图
        },
      }),
    });

    // 返回结果

    const json = await response.json();
    const taskId = json?.output?.task_id;  // 获取任务 ID

    if (!taskId) {
      throw new Error("获取任务ID失败：" + JSON.stringify(json));
    }

    // console.log("DashScope 异步任务 task_id:", taskId);

    // === 开始轮询直到任务完成 ===
    const resultJson = await pollUntilComplete(taskId, apiKey);

    // === 错误处理 ===
    const result = resultJson.output?.results?.[0];
    if (!result || !result.url) {
      throw new Error("未获取到生成图像链接");
    }

    const imageResponse = await fetch(result.url);  // 获取图像的 url
    if (!imageResponse.ok) {
      throw new Error("无法下载生成的图片");
    }

    const buffer = await imageResponse.arrayBuffer();

    return buffer;
  },
});

// 图像生成文本功能
export const imageGenerateText = action({
  args: {
    base64URL: v.string(),
    style: v.string(),
  }, handler: async(ctx, args) => {
    try {

      if (!args.base64URL || !args.style) throw new Error("图像必须上传，且必须选择某一个社交平台风格");

      // 生成图像的提示词
      let prompt = `请你理解这张图片，生成图片描述，并根据“${args.style}”社交平台的风格，结合图片描述，生成一段符合该平台用户口味的旅行文案。`;

      const completion = await openai.chat.completions.create({
          model: "qwen-omni-turbo",  //只有该模型可以读取 base64 格式的图像
          // type 定义传入类型
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url:{"url": args.base64URL}}, 
                { type: "text", text: prompt },
              ]
            }
          ],
          stream: true,
          modalities: ["text"],  // 输出文本
      });

      // 拼接流式返回结果
      let finalText = "";
      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) finalText += delta;
      }

      console.log("文案：",finalText);

      return { text: finalText };  // 返回结果

    } catch (error) {
      // 打印错误日记
      console.error("图片生成文案失败:", error);
      throw new Error(`生成文案出错: ${error}`);
    }
  }
})

