import { differenceInDays } from "date-fns";
import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "./schemas";
import OpenAI from "openai";
import { OpenAIInputType } from "@/types";

const openai = new OpenAI(
    {
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);


// ==== 系统提示词 ====
// 生成目的地介绍 & 最佳旅行时间的 Prompt
const PROMPT_BATCH1 = (userPrompt: string) => `
你是一个旅行规划助手，请根据以下要求生成 JSON 数据：

### 要求
- 请严格按照示例格式返回 JSON，不要包含任何解释性文字
- 字段必须包含：
  - abouttheplace: 至少50字的地点介绍
  - besttimetovisit: 最佳游览时间（如"3-5月"）
- 如果信息不足，用空字符串代替

### 示例格式
{
  "abouttheplace": "杭州是中国东南部著名旅游城市...",
  "besttimetovisit": "3月-5月或9月-11月"
}

### 用户需求
${userPrompt}
`;

// 生成食物推荐 & 行李清单的 Prompt
const PROMPT_BATCH2 = (prompt: string) => `
请根据以下旅行需求生成 JSON 数据：

### 要求
- 输出格式为纯 JSON，不要包含任何解释性文字
- 字段必须包含：
  - localfood: 5 个当地特色美食
  - packingchecklist: 10 件必带物品（考虑天气/活动）
- 保持数组顺序从重要到次要排列

### 示例格式
{
  "localfood": ["西湖醋鱼", "东坡肉", "..."],
  "packingchecklist": ["防晒霜", "雨伞", "..."]
}

### 旅行需求
${prompt}
`;

// 生成行程规划的 Prompt
const PROMPT_BATCH3 = (prompt: string) => `
请根据以下旅行计划生成 JSON 格式的每日行程：

### 要求
- 输出格式为纯 JSON，不要包含任何解释性文字
- 行程需包含多个天数对象
- 每天包含上午/下午/晚上的活动
- 每个活动包含：
  - itineraryItem: 活动名称
  - place.name: 地点名称
  - place.coordinates: 经纬度（可估算）
  - briefDescription: 简要说明

### 示例格式
{
  "itinerary": [
    {
      "title": "第 1 天：雷峰塔之旅",
      "activities": {
        "morning": [
          {
            "itineraryItem": "参观雷峰塔",
            "place": {
              "name": "雷峰塔",
              "coordinates": {"lat": 30.2448, "lng": 120.1464}
            },
            "briefDescription": "西湖标志性景点"
          }
        ],
        "afternoon": [],
        "evening": []
      }
    }
  ]
}

### 旅行计划
${prompt}
`;

// 大模型接口
const callOpenAIApi = async (fullPrompt: string) => {
  try {
    console.log("调用 OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行规划助手，所有输出必须为合法 JSON 格式，不要包含任何解释性文字。"
        },
        { role: "user", content: fullPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2048,
      // 结构化输出
      response_format: {
        type: "json_object",
      }
    });

    const jsonString = completion.choices[0]?.message?.content || "";
    console.log("OpenAI API 响应:", jsonString);
    return jsonString;

  } catch (error) {
    console.error("API 调用失败:", error);
    throw new Error("大模型服务调用失败");
  }
}

// 生成目的地介绍和最佳旅行时间
export const generatebatch1 = async (promptText: string) => {
  const fullPrompt = PROMPT_BATCH1(promptText);
  const response = await callOpenAIApi(fullPrompt);
  try {
    // 解析 JSON 字符串
    const result = JSON.parse(response);
    batch1Schema.parse(result);  // 验证 JSON 格式
    // 打印生成的结果
    console.log("生成的目的地介绍和最佳旅行时间:", result);
    return { data: result };
  } catch (e) {
    console.error("JSON 解析失败:", response);
    console.error("错误详情:", e);
    throw new Error("大模型返回格式错误");
  }
}


// 生成食物推荐、行李清单
export const generatebatch2 = async (inputParams: OpenAIInputType) => {
  const prompt = getPropmpt(inputParams);  // 根据用户输入生成提示词
  const fullprompt = PROMPT_BATCH2(prompt);  // 生成完整的提示词
  const response = await callOpenAIApi(fullprompt);
  try {
    // 解析 JSON 字符串
    const result = JSON.parse(response);
    // 验证 JSON 格式
    batch2Schema.parse(result);
    // 打印生成的结果
    console.log("生成的食物推荐和行李清单:", result);
    return { data: result };
  } catch (e) {
    console.error("JSON 解析失败:", response);
    console.error("错误详情:", e);
    throw new Error("大模型返回格式错误");
  }
}

// 生成行程规划
export const generatebatch3 = async (inputParams: OpenAIInputType) => {
  const prompt = getPropmpt(inputParams);
  const fullprompt = PROMPT_BATCH3(prompt);

  const response = await callOpenAIApi(fullprompt);
  try {
    const result = JSON.parse(response);
    // 验证 JSON 格式
    batch3Schema.parse(result);
    // 打印生成的结果
    console.log("生成的行程规划:", result);
    // 返回结果
    return { data: result };
  } catch (error) {
    console.error("JSON 解析错误：", response);
    console.error("错误详情:", error);
    throw new Error("大模型返回格式错误");
  }
}

// 根据用户输入的表单形成提示词 prompt
const getPropmpt = ({ 
  userPrompt,  // 基础的 userPrompt 只有目的地名称
  travelType, 
  travelPersons, 
  fromDate, 
  toDate,
  budget, 
}: OpenAIInputType
) => {
  
  let prompt = userPrompt;

  // 时间戳转中文日期
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (fromDate && toDate){
    const days = differenceInDays(toDate, fromDate) + 1;
    const from = formatDate(fromDate);
    const to = formatDate(toDate);
    prompt += `，旅行时间为 ${from} 到 ${to}， 共 ${days} 天，请为我规划 ${days} 天的每日行程安排`;
  } 
  if (travelPersons !== undefined) prompt += `，同行人数为 ${travelPersons} 人`;
  if (travelType && travelType.length > 0) prompt += `，偏好的旅行模式为 ${travelType}`;
  // 添加预算
  if (budget) prompt += `，预算为 ${budget} 元`;

  return prompt;
}