import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// 输入城市名，获取城市编码 adcode
async function getAdcodeByCityName(city: string, amapKey: string): Promise<string | null> {
  const url = `https://restapi.amap.com/v3/config/district?keywords=${city}&key=${amapKey}&subdistrict=0`;
  const resp = await fetch(url, { method: "GET" });
  const data = await resp.json();
  if (data.status === "1" && data.districts?.length > 0) {
    console.log("天气",data);
    return data.districts[0].adcode;
  }
  return null;
}
// 输入城市，查询天气
export const getAmapWeather = action({
  args: { city: v.string() },
  async handler(ctx, { city }) {
    // 获取高德地图 API 
    const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!amapKey || !city) {
      throw new ConvexError("缺少高德API KEY或城市名");
    }

    // 将城市名转换为城市编码 adcode
    const adcode = await getAdcodeByCityName(city, amapKey);
    if (!adcode) throw new ConvexError("未找到该城市的adcode");

    // 构造请求URL
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${amapKey}&extensions=all`;

    // 获取天气结果
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();

    if (data.status !== "1") {
      throw new ConvexError("高德天气查询失败: " + (data.info || "未知错误"));
    }

    // 返回预报天气信息
    return data.forecasts?.[0] || null;
  },
});