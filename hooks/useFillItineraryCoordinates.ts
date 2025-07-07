import { usePlaceSearch } from "@/hooks/uaePlaceSearch";
import { useMapContext } from "@/contexts/MapContext";
import { useEffect, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Location } from "@/types";

// 该方法使用 PlaceSearch 实例来查询行程表中的地点，并校验经纬度信息

export function useFillItineraryCoordinates(
    city: string, 
    itinerary: Doc<"planDetails">["itinerary"],
) {
    // 获取地点搜索实例
    const placeSearch = usePlaceSearch({ city }); 
    // 从 MapContext 中获取 setLocations 方法
    const { locations, setLocations } = useMapContext();

    // !用于存储更新后的行程表
    const [newItinerary, setNewItinerary] = useState<Doc<"planDetails">["itinerary"]>([]);
    // ! 标记是否完成所有的地点搜索
    const [isReady, setIsReady] = useState(false);

    // 当 placeSearch 或 itinerary 变化时，执行以下逻辑
    useEffect(() => {
        if (!placeSearch || !itinerary || itinerary.length === 0) return;

        // 收集所有地名并去重
        const allPlaces = new Set<string>();
        itinerary.forEach((day) => {
            (["morning", "afternoon", "evening"] as Array<'morning' | 'afternoon' | 'evening'>).forEach((period) => {
                day.activities[period]?.forEach((activity) => {
                if (activity.place && activity.place.name) {
                    allPlaces.add(activity.place.name);
                }
                });
            });
        });

        // 统计地名数量
        let count = 0;
        const total = allPlaces.size;

        // 查询每个地名并补全经纬度
        allPlaces.forEach((name) => {
            placeSearch.search(name, (status: string, result: any) => {
                if (status === "complete" && result.poiList.pois.length > 0) {
                    // 获取第一个 POI 查询匹配地点
                    const poi = result.poiList.pois[0];
                    // 获取经纬度
                    const lng = poi.location.getLng();
                    const lat = poi.location.getLat();
                    
                    // 先判断是否已存在，更新到 MapContext
                    if (!locations.some((loc: Location) => loc.name === name)) {
                        setLocations([
                        ...locations,
                        { name, position: [lng, lat] as [number, number] }
                        ]);
                    }

                    // !同步到 itinerary
                    setNewItinerary(prevItinerary => 
                        prevItinerary.map(day => ({
                            ...day,
                            activities: {
                                ...day.activities,
                                morning: day.activities.morning?.map(act => 
                                    act.place?.name === name
                                        ? { ...act, place: { ...act.place, coordinates: { lat, lng } } }
                                        : act
                                ),
                                afternoon: day.activities.afternoon?.map(act => 
                                    act.place?.name === name
                                        ? { ...act, place: { ...act.place, coordinates: { lat, lng } } }
                                        : act
                                ),
                                evening: day.activities.evening?.map(act => 
                                    act.place?.name === name
                                        ? { ...act, place: { ...act.place, coordinates: { lat, lng } } }
                                        : act
                                ),
                            }
                        }))
                    );

                    // 更新计数器
                    count++;
                    if (count === total) {
                        setIsReady(true); // 所有搜索完成
                    }
                    
                } else if (status === "error") {
                    console.error(`搜索地点出错 "${name}": ${result}`);
                }
            });
        });
        
    }, [placeSearch, itinerary, setLocations]);
    
    return { newItinerary, isReady };

}