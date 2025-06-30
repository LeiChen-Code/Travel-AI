import ItineraryDayHeader from "@/components/Itinerary/ItineraryDayHeader";
import { TimelineProps } from "@/types";
import { Sun, Sunrise, Sunset, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { useMapContext } from "@/contexts/MapContext";
import Image from "next/image";

// 此组件定义行程时间表
const Timeline = ({itinerary, planId, allowEdit}: TimelineProps) => {
  // 如果 itinerary 存在但长度为 0，说明没有行程安排
  if (itinerary && itinerary.length === 0)
    return (
      <div className="flex justify-center items-center p-4">
        点击 + 创建一天的行程
      </div>
    );

  // 过滤掉早上、下午和晚上都没有活动的日期
  const filteredItinerary = itinerary?.filter((day) => {
    const isMorningEmpty = day.activities.morning.length === 0;
    const isAfternoonEmpty = day.activities.afternoon.length === 0;
    const isEveningEmpty = day.activities.evening.length === 0;

    return !(isMorningEmpty && isAfternoonEmpty && isEveningEmpty);
  });

  return (
    // ol 为有序列表 ordered list，自动为列表项添加编号
    <ol className="relative border-s border-gray-200 ml-5 mt-5">
      {filteredItinerary?.map((day) => (
        // li 表示列表项 list item，定义列表中的每一项，每一天用一个 li 表示
        <li className="mb-10 ms-6" key={day.title}>
          {/* 渲染日历图标 */}
          <span className="absolute flex items-center justify-center w-6 h-6 bg-white-1 rounded-full -start-3 ring-1 ring-gray-1">
            <svg
              className="w-2.5 h-2.5 text-gray-4 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </span>

          {/* 一天的标题 */}
          <ItineraryDayHeader planId={planId} title={day.title} allowEdit={allowEdit} itineraryDay={day}/>
          {/* 具体活动 */}
          <div className="flex flex-col gap-3">
            <Activity
              activity={day.activities.morning}
              heading="早上"
              icon={<Sunrise className="w-4 h-4 text-blue-500" />}
            />
            <Activity
              activity={day.activities.afternoon}
              heading="下午"
              icon={<Sun className="w-4 h-4 text-yellow-500" />}
            />
            <Activity
              activity={day.activities.evening}
              heading="晚上"
              icon={<Sunset className="w-4 h-4 text-gray-600 dark:text-white" />}
            />
          </div>
        </li>
      ))}
    </ol>
  );
};

// 定义活动组件
const Activity = ({
  activity,
  heading,
  icon,
}: {
  activity: {
    itineraryItem: string; 
    briefDescription: string;
    place: {
      name: string;
      coordinates: { lat: number; lng: number; }
    }
  }[];
  heading: string;
  icon: ReactNode;
}) => {
  // 设置点击地名的状态
  const { setSelectedLocation } = useMapContext();
  
  if (activity.length == 0) return null;
  return (
    <div className="flex flex-col gap-2 border-b border-gray-200">
      {/* 标题：早上/下午/晚上 */}
      <h3
        className="text-base mt-2 w-max p-2 font-semibold
                  flex justify-center gap-2 items-center capitalize"
      >
        {icon}
        <div className="text-foreground">{heading}</div>
      </h3>

      {/* 活动标题和活动描述，ul 是无序列表 unordered list，ul 展示某个时间段的活动 */}
      <ul className="space-y-1 text-muted-foreground pl-2">
        {activity.map((act, index) => (
          // 每个活动用 li 表示
          <li key={index}>
            <div className="w-full p-1 text-base overflow-hidden">
              <div className="flex gap-2 p-2 items-center">
                {/* 活动标题 */}
                <span className="flex text-foreground font-medium">{act.itineraryItem}</span>
                {/* 地点信息 */}
                {act.place && (
                  <div className="flex gap-2 text-sm bg-slate-100 text-black-1 p-2 rounded-md hover:text-blue-1">
                    {/* 设置点击地点事件 */}
                    <Image
                      src="/icons/map-pin.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span className="cursor-pointer" onClick={() => setSelectedLocation({
                        name: act.place.name,
                        position: [act.place.coordinates.lng, act.place.coordinates.lat],
                      })}>
                      {act.place.name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* 活动描述 */}
              <p className="max-w-md md:max-w-full text-wrap whitespace-pre-line p-2">
                {act.briefDescription}
              </p>
            </div>
          </li>
        ))}
      </ul>
      

    </div>
  );
};

export default Timeline;