import { Location } from "@/types";
import { loadPlaceSearch } from "./loadPlaceSearch";

/**
 * @param city 城市名称（如 "上海"）
 * @param locations 原始地点数组
 * @returns 坐标补全后的地点数组
 */

export async function fillCoordinatesForItinerary(
  city: string,
  locations: Location[],
): Promise<Location[]> {
    if (typeof window === "undefined") {
        throw new Error("fillCoordinatesForItinerary 只能在浏览器中运行");
    }

    console.log(`开始坐标补全: 城市 = ${city}, 地点数量 = ${locations.length}`);

    const placeSearch = await loadPlaceSearch({ city });

    // 输入 地名 通过 PlaceSearch 查询经纬度
    const getCoord = (name: string): Promise<{ lng: number; lat: number; name: string } | null> => {
        return new Promise((resolve) => {
        placeSearch.search(name, (status: string, result: any) => {
            if (status === "complete" && result.poiList.pois.length > 0) {
                const poi = result.poiList.pois[0]
                console.log(`地点 "${name}" 匹配成功 -> ${poi.name} (${poi.lng}, ${poi.lat})`);
                resolve({
                    name: poi.name, // 更新地名
                    lng: poi.location.getLng(),
                    lat: poi.location.getLat(),
                });
            } else {
                console.warn(`地点 "${name}" 查无结果`);
                resolve(null); // 查不到
            }
        });
        });
    };

    const result: Location[] = [];

    for (const loc of locations) {
        console.log(`正在处理地点: ${loc.name}`);
        const coord = await getCoord(loc.name);
        if (coord) {
            result.push({
                name: coord.name, 
                position: [coord.lng, coord.lat],
            });
        } else {
            result.push(loc); // fallback 原始
        }
    }
    
    console.log(`坐标补全完成，原始 ${locations.length} 个，最终结果 ${result.length} 个`);

    return result;
}
