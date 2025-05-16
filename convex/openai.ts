import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI(
    {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

export const generateText = action({
    args: {input: v.string()},
    handler: async (_, {input}) => {
        // 使用参数
        const completion = await openai.chat.completions.create({
        model: "qwen-plus",  //可按需更换模型名称。
            messages: [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": input}
            ],
            stream: true,
        });

        // 流式输出
        const chunks: Uint8Array[] = [];
        
        for await (const chunk of completion) {
            // console.log(JSON.stringify(chunk));
            chunks.push(new TextEncoder().encode(JSON.stringify(chunk)));
        }
        
        const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            buffer.set(chunk, offset);
            offset += chunk.length;
        }
        
        return buffer;
    },
})

// console.log("思考过程：")
// console.log(completion.choices[0].message.reasoning_content)
// console.log("最终答案：")
// console.log(completion.choices[0].message.content)


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
