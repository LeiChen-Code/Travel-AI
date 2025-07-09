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

    const placeSearch = await loadPlaceSearch({ city });

    // 输入 地名 通过 PlaceSearch 查询经纬度
    const getCoord = (name: string): Promise<[number, number] | null> => {
        return new Promise((resolve) => {
            placeSearch.search(name, (status: string, result: any) => {
                if (status === "complete" && result.poiList.pois.length > 0) {
                    const poi = result.poiList.pois[0];
                    const lng = poi.location.getLng();
                    const lat = poi.location.getLat();
                    resolve([lng, lat]);
                } else {
                    resolve(null); // 查不到
                }
            });
        });
    };

    const result: Location[] = [];

    for (const loc of locations) {
        const coord = await getCoord(loc.name);
        if (coord) {
            result.push({
                ...loc,
                position: coord,
            });
        } else {
            result.push(loc); // fallback 原始
        }
    }
    
    return result;
}
