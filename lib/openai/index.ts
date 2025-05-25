import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "./schemas";

import OpenAI from "openai";

const openai = new OpenAI(
    {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

const promptSuffix = `根据提供的模式(schema)以 JSON 格式生成旅行数据，
                     响应内容中除了大括号内的内容外，不要返回任何其他内容，且都是中文。
                     生成旅行计划时，给定的日期、旅行模式(travelType)和同行人数(travelPersons)可能会产生约 50% 的影响。`;

// 大模型接口
const callOpenAIApi = (prompt: string, schema: any, description: string) => {
  
  // // 将 schema 整合到 prompt 中
  // const fullPrompt = `Schema: ${JSON.stringify(schema)}\nDescription: ${description}\n${prompt}`;
  // 打印日志
  console.log({ prompt, schema });

  const completion = openai.chat.completions.create({
    model: "qwen-plus",  // 调用通义千问
    messages: [
      { role: "system", content: "You are a helpful travel assistant." },
      { role: "user", content: prompt },
    ],
    tools: [{  type: "function", function: { name: "set_travel_details", parameters: schema, description:description } }],
    tool_choice: { type: "function", function: { name: "set_travel_details" } },
  });
  return completion;
}

// 生成目的地介绍和最佳旅行时间
export const generatebatch1 = (promptText: string) => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `根据以下模式生成关于一个地方或地点的信息描述：

  - 旅行目的地介绍：
    - 包含一个描述该旅行地点的字符串，至少 50 个词。
  
  - 最佳游览时间：
    - 一个指定游览该地方最佳时间的字符串。
  
  确保函数响应符合提供的模式，并采用 JSON 格式。响应内容不应包含模式定义之外的任何内容。
  `;
  return callOpenAIApi(prompt, batch1Schema, description);
}

type OpenAIInputType = {
  userPrompt: string;
  travelType?: string | undefined;
  travelPersons?: number | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
};

// 生成食物推荐、行李清单
export const generatebatch2 = (inputParams: OpenAIInputType) => {
  const description = `根据以下模式生成一次旅行的推荐描述：
  
  - 当地美食推荐：
    - 一个数组，每个元素是旅行期间关于旅行目的地的美食。
  
  - 旅行打包清单：
    - 一个旅行打包清单数组，每个元素是关于旅行目的地需要携带的物品，需要结合旅行目的地推荐物品。
  
  确保函数响应符合提供的模式，并采用 JSON 格式。响应内容不应包含模式定义之外的任何内容。`;
  return callOpenAIApi(getPropmpt(inputParams), batch2Schema, description);
}

// 生成行程规划
export const generatebatch3 = (inputParams: OpenAIInputType) => {
  // 补充地点
  const description = `根据以下模式，为用户指定的地点生成旅行行程：
  - 行程安排：
    - 一个包含指定天数行程详情的数组。
    - 每天的行程包括一个标题以及上午、下午和晚上的活动。
    - 活动描述如下：
      - 上午、下午、晚上：
        - 每个时段都包含一个行程项目数组，每个项目都有一个描述、简要说明，以及具体地点的名称和经纬度。

  确保函数响应符合提供的模式，并采用 JSON 格式。响应内容不应包含模式定义之外的任何内容。`;
  return callOpenAIApi(getPropmpt(inputParams), batch3Schema, description);
}

// 根据用户输入的表单行程提示词 prompt
const getPropmpt = ({ userPrompt, travelType, travelPersons, fromDate, toDate }: OpenAIInputType) => {
  let prompt = `${userPrompt}, 从-${fromDate} 到-${toDate}`;

  if (travelPersons !== undefined) prompt += `${prompt}, 同行人数为-${travelPersons}`;

  if (travelType && travelType.length > 0) prompt += `${prompt}, 偏好的旅行模式为-${travelType}`;

  // 添加预算

  prompt = `${prompt}, ${promptSuffix}`;
  return prompt;
}