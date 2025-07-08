import { usePlaceSearch } from "@/hooks/uaePlaceSearch";
import { useMapContext } from "@/contexts/MapContext";
import { useEffect, useRef, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";

// 该方法使用 PlaceSearch 实例来查询行程表中的地点，并校验经纬度信息，生成坐标表

export function useFillItineraryCoordinates(
  city: string,
  itinerary: Doc<"planDetails">["itinerary"]
) {
  const placeSearch = usePlaceSearch({ city });
  const { locations, setLocations } = useMapContext();

  const [isReady, setIsReady] = useState(false);
  const coordinatesMapRef = useRef(new Map<string, { lat: number; lng: number }>());

  useEffect(() => {
    if (!placeSearch || !itinerary || itinerary.length === 0) {
      setIsReady(true);
      return;
    }

    const allPlaces = new Set<string>();
    itinerary.forEach((day) => {
      (["morning", "afternoon", "evening"] as const).forEach((period) => {
        day.activities[period]?.forEach((activity) => {
          if (activity.place?.name) {
            allPlaces.add(activity.place.name);
          }
        });
      });
    });

    const placeArray = Array.from(allPlaces);
    if (placeArray.length === 0) {
      setIsReady(true);
      return;
    }

    const searchPlace = (name: string): Promise<void> => {
      return new Promise((resolve) => {
        placeSearch.search(name, (status: string, result: any) => {
          if (status === "complete" && result?.poiList?.pois?.length > 0) {
            const poi = result.poiList.pois[0];
            const lng = poi.location.getLng();
            const lat = poi.location.getLat();
            coordinatesMapRef.current.set(name, { lat, lng });

            const newLocation = { name, position: [lng, lat] as [number, number] };
            setLocations([...locations, newLocation]);
          }
          resolve();
        });
      });
    };

    const runSequential = async () => {
      for (const name of placeArray) {
        await searchPlace(name);
      }
      setIsReady(true);
    };

    runSequential();
  }, [placeSearch, itinerary, city]);

  return { isReady, coordinatesMap: coordinatesMapRef.current };
}