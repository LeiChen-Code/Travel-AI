import { differenceInDays } from "date-fns";
import {
  batch1Schema,
  batch2Schema,
} from "./schemas";
import OpenAI from "openai";
import { OpenAIInputType } from "@/types";
import { cleanItineraryData } from "./cleaners";

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
  - abouttheplace: 至少50字的地点介绍（包含地理/文化特色）
  - besttimetovisit: 最佳游览时间（格式：时间段 + 原因说明，如"3月-5月（春秋季气候宜人，花景最美）"）
- 如果信息不足，用空字符串代替

### 示例格式
{
  "abouttheplace": "杭州是中国东南部著名旅游城市...",
  "besttimetovisit": "3月-5月（春秋季气候宜人，樱花/桃花盛开，适合户外踏青）或9月-11月（秋高气爽，桂花飘香，避开暑期高峰且有中秋/重阳节庆活动）"
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
  - localfood: 5 个当地特色美食（按季节性推荐，如"秋季大闸蟹"）
  - packingchecklist: 10 件必带物品，需结合：
    1. **气候特征**（如"多雨地区需防水装备"）
    2. **地理环境**（如"高原旅行需防晒/保暖用品"）
    3. **旅行方式**（如"自驾游需导航仪，徒步需登山杖"）
- 数组顺序按优先级排列（从重要到次要）

### 示例格式
{
  "localfood": ["西湖醋鱼", "龙井虾仁", "东坡肉", "藕粉", "猫耳朵"],
  "packingchecklist": [
    "防水冲锋衣（雨季必备）",
    "防滑登山鞋（山区适用）",
    "便携式海拔氧气瓶（高原旅行）",
    "紫外线墨镜（高原强日照）",
    "折叠保温杯（温差大地区）",
    "便携充电宝（户外活动多）",
    "防水收纳袋（水上活动）",
    "便携医药包（应急使用）",
    "速干防晒帽（夏季出行）",
    "便携充电宝（户外活动多）"
  ]
}

### 旅行需求
${prompt}
`;


// 生成行程规划的 Prompt
const PROMPT_BATCH3 = (prompt: string) => `
请根据以下旅行计划生成 JSON 格式的每日行程：

### 要求
- 输出格式为纯 JSON，不要包含任何解释性文字
- 不要添加任何未在示例中出现的字段（如 costEstimate、rating 等）
- 行程需包含多个天数对象
- 每天包含上午/下午/晚上的活动
- 每个活动必须包含：
  - itineraryItem: 活动名称（如"参观雷峰塔"）
  - place.name: 地点名称（精确到具体景区）
  - place.coordinates: 经纬度（可估算）
  - briefDescription: 简要说明（要求：**不少于100字**，需包含以下内容）
    1. 景点历史背景（如"始建于南宋，重建于2002年"）
    2. 建筑特色（如"钢架铜瓦，塔身高度71米"）
    3. 推荐理由（如"西湖十景之一，俯瞰全景最佳位置"）
    4. 游览建议（如"建议傍晚登塔，欣赏落日与城市夜景"）
- JSON结尾禁止出现逗号

### 示例格式
{
  "itinerary": [
    {
      "title": "第1天：西湖经典线路",
      "activities": {
        "morning": [
          {
            "itineraryItem": "游览雷峰塔",
            "place": {
              "name": "雷峰塔景区",
              "coordinates": {"lat": 30.2448, "lng": 120.1464}
            },
            "briefDescription": "雷峰塔始建于北宋太平兴国二年（977年）...（此处省略详细描述）"
          }  // 注意：此处已移除尾部逗号
        ],
        "afternoon": [
          {
            "itineraryItem": "漫步苏堤",
            "place": {
              "name": "苏堤春晓",
              "coordinates": {"lat": 30.2328, "lng": 120.1545}
            },
            "briefDescription": "苏堤由北宋大文豪苏轼在1089年...（此处省略详细描述）"
          }  // 注意：此处已移除尾部逗号
        ],
        "evening": []  // 空数组示例
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
    // 验证 JSON 格式 并 清洗数据
    const cleanedData = cleanItineraryData(result);
    // 打印生成的结果
    console.log("生成的行程规划:", cleanedData);
    // 返回结果
    return { data: cleanedData };
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