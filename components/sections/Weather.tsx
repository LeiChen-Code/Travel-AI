"use client";
import SectionWrapper from "@/components/sections/SectionWrapper";
import {Skeleton} from "@/components/ui/skeleton";
import { WeatherForecastResponse } from "@/types";
import {
  Cloud,
} from "lucide-react";
import {ReactNode, useEffect, useState} from "react";

const Weather = ({placeName}: {placeName: string | undefined}) => {

    // 读取天气数据
    const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
    // 加载状态
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    useEffect(() => {
        if (!placeName || hasFetched) return;
        setLoading(true);

        fetch(`/api/weather?city=${placeName}`)
            .then(res => res.json())
            .then(data => {
                console.log("weather data:", data);
                setWeatherData(data);
                setHasFetched(true);
            })
            .finally(() => setLoading(false));

    }, [placeName, hasFetched]);

    return (
        <SectionWrapper id="weather">
            <h2 className="mb-2 text-lg font-semibold tracking-wide flex items-center">
                <Cloud className="mr-2" /> 天气预报
            </h2>
            {loading ? (
                <WeatherLoadingSkeleton />
            ) : !weatherData ? (
                <p className="ml-8">未获取到 {placeName} 的天气信息</p>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="font-medium">
                        {weatherData.province} {weatherData.city}（{weatherData.reporttime}）
                    </div>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                        {Array.isArray(weatherData.casts) && weatherData.casts.length > 0 ? (
                            weatherData.casts.map((cast) => (
                            <WeatherTile key={cast.date}>
                                <div className="font-semibold p-4">{cast.date}（周{cast.week}）</div>
                                <div className="text-sm flex flex-col gap-2">
                                    <div>白天：{cast.dayweather}，{cast.daytemp}°C，风向{cast.daywind}，风力{cast.daypower}</div>
                                    <div>夜间：{cast.nightweather}，{cast.nighttemp}°C，风向{cast.nightwind}，风力{cast.nightpower}</div>
                                </div> 
                            </WeatherTile>
                            ))
                        ) : (
                            <div className="ml-8">暂无天气预报数据</div>
                        )}
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
};

const WeatherTile = ({children}: {children: ReactNode}) => {
  return (
    <div
      className="min-h-[184px] rounded-xl flex-grow 
                    w-full h-full flex flex-col justify-center items-center
                    p-5 shadow-md dark:border dark:border-border"
    >
      {children}
    </div>
  );
};

const WeatherLoadingSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 grid-flow-row justify-center items-center min-h-[100px] gap-5">
      {Array.from({length: 4}).map((_, i) => (
        <div
          key={i}
          className="rounded-xl w-full h-full flex flex-col justify-center items-center p-5 shadow-md"
        >
          <Skeleton />
        </div>
      ))}
    </div>
  );
};

export default Weather;