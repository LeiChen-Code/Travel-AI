import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// 读取 CSV 并查找城市名对应的 adcode
async function getAdcodeByCityName(city: string): Promise<string | null> {
  const csvPath = path.join(process.cwd(), "lib", "AMap_adcode_citycode.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  // 按行分割
  const lines = content.split("\n");
  for (const line of lines) {
    // 跳过表头
    if (line.startsWith("中文名")) continue;
    const [name, adcode] = line.split(",");
    if (name && adcode && name.trim().replace(/["']/g, "") === city.trim()) {
      return adcode.trim();
    }
  }
  return null;
}

// GET /api/weather?city=城市名
export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const amapKey = process.env.AMAP_RESTAPI_KEY;
  
  console.log("开始加载高德")

  if (!amapKey || !city) {
    return NextResponse.json({ error: "缺少高德API KEY或城市名" }, { status: 400 });
  }

  // 将城市名转换为城市编码 adcode
  const adcode = await getAdcodeByCityName(city);
  if (!adcode) {
    return NextResponse.json({ error: "未找到该城市的adcode" }, { status: 404 });
  }

  // 构造天气查询URL
  const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${amapKey}&extensions=all`;

  // 获取天气结果
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();

  if (data.status !== "1") {
    return NextResponse.json({ error: "高德天气查询失败: " + (data.info || "未知错误") }, { status: 500 });
  }

  // 返回预报天气信息
  return NextResponse.json(data.forecasts?.[0] || null);
}