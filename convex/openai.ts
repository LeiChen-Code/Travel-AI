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