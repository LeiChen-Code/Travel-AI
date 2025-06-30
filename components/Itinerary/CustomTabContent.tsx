import ErrorMessage from "@/components/Itinerary/ErrorMessage";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {Label} from "@radix-ui/react-label";
import {TabsContent} from "@radix-ui/react-tabs";
import {TrashIcon, Plus} from "lucide-react";
import {register} from "module";
import {Input} from "@/components/ui/input";
import {
  FieldErrors,
  UseFieldArrayRemove,
  UseFormGetFieldState,
  UseFormRegister,
} from "react-hook-form";
import {ItineraryType} from "@/components/Itinerary/ItineraryDayForm";

// 此组件渲染和管理行程表单中某一个时间段（早上、下午、晚上）的所有活动输入项
// 并为每个活动提供动态增删、表单校验和错误提示等功能

// 约束 CustomTabContent 组件的 props 类型
type TabContentProps = {
  tabName: "morning" | "afternoon" | "evening";  // 当前时间段
  addNewControl: (fieldArrayName: string) => void;
  register: UseFormRegister<{
    itinerary: ItineraryType;
  }>;
  fields: {
    itineraryItem: string;
    briefDescription: string;
    place: {
      name: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    id: string;
  }[];  // fields 活动数组
  errors: FieldErrors<{
    itinerary: ItineraryType;
  }>;
  getFieldState: UseFormGetFieldState<{
    itinerary: ItineraryType;
  }>;
  remove: UseFieldArrayRemove;
};

export default function CustomTabContent({
  tabName,
  register,
  fields,
  errors,
  getFieldState,
  remove,
  addNewControl,
}: TabContentProps) {
  return (
    // 渲染行程表单中某个时间段（如早上、下午、晚上）的所有活动输入项
    <TabsContent value={tabName}>
      {fields.map((field, index) => {
        const errorForFieldPlaceName =
          errors?.itinerary?.activities?.[tabName]?.[index]?.itineraryItem;
        const errorForFieldPlaceDesc =
          errors?.itinerary?.activities?.[tabName]?.[index]?.briefDescription;

        const itineraryItemState = getFieldState(
          `itinerary.activities.${tabName}.${index}.itineraryItem`
        );
        const briefDescriptionState = getFieldState(
          `itinerary.activities.${tabName}.${index}.briefDescription`
        );

        return (
          <div
            className="flex flex-col gap-5 w-full justify-start items-center
                    mt-2 bg-background py-2 rounded-lg"
            key={field.id}
          >
            {/* 活动标题 */}
            <div className="flex flex-col gap-2 justify-center items-start w-full">
              {/* 活动 header */}
              <div className="flex justify-between w-full items-center">
                <Label
                  className="text-sm font-medium font-sans tracking-wide"
                  htmlFor={`itinerary.activities.${tabName}.${index}.itineraryItem`}
                >
                  活动标题
                </Label>
                <Button
                  className="text-gray-500 rounded-full p-3"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <TrashIcon className="w-4 h-4 hover:text-red-500" />
                </Button>
              </div>
              {/* 输入框 */}
              <Input
                {...register(`itinerary.activities.${tabName}.${index}.itineraryItem` as const)}
                placeholder="添加活动标题"
                defaultValue={field.itineraryItem}
                id={`itinerary.activities.${tabName}.${index}.itineraryItem`}
                className={cn(
                  "border p-2 border-gray-300 w-full flex-1",
                  itineraryItemState.isTouched &&
                    errorForFieldPlaceName &&
                    "border-red-500 border-2"
                )}
              />
              {/* 输入有误的提示信息 */}
              <ErrorMessage
                error={errorForFieldPlaceName}
                isTouched={itineraryItemState.isTouched}
              />
            </div>
            
            {/* 活动描述 */}
            <div className="flex flex-col gap-2 justify-center items-start w-full">
              <Label
                htmlFor={`itinerary.activities.${tabName}.${index}.briefDescription`}
                className="text-sm font-medium font-sans tracking-wide"
              >
                活动描述
              </Label>

              <Textarea
                {...register(`itinerary.activities.${tabName}.${index}.briefDescription` as const)}
                placeholder="添加活动描述"
                defaultValue={field.itineraryItem}
                id={`itinerary.activities.${tabName}.${index}.briefDescription`}
                className={cn(
                  "border p-2 border-gray-300 w-full",
                  briefDescriptionState.isTouched &&
                    errorForFieldPlaceDesc &&
                    "border-red-500 border-2"
                )}
              />
              {errorForFieldPlaceDesc?.message && briefDescriptionState.isTouched && (
                <p className="text-sm font-thin text-red-400">{errorForFieldPlaceDesc?.message}</p>
              )}
            </div>

            {/* 地点信息 */}
            <div className="flex flex-col gap-2 justify-center items-start w-full">
              <Label
                htmlFor={`itinerary.activities.${tabName}.${index}.place.name`}
                className="text-sm font-medium font-sans tracking-wide"
              >
                地点名称
              </Label>
              <Input
                {...register(`itinerary.activities.${tabName}.${index}.place.name` as const)}
                placeholder="请输入地点名称"
                defaultValue={field.place?.name}
                id={`itinerary.activities.${tabName}.${index}.place.name`}
                className="border p-2 border-gray-300 w-full"
              />
              {/* 可选：地点名称错误提示 */}
              {/* <ErrorMessage ... /> */}
            </div>

            <div className="flex gap-4 w-full">
              <div className="flex flex-col flex-1 gap-2">
                <Label
                  htmlFor={`itinerary.activities.${tabName}.${index}.place.coordinates.lat`}
                  className="text-sm font-medium"
                >
                  纬度
                </Label>
                <Input
                  type="number"
                  step="any"
                  {...register(`itinerary.activities.${tabName}.${index}.place.coordinates.lat` as const)}
                  placeholder="纬度"
                  defaultValue={field.place?.coordinates?.lat}
                  id={`itinerary.activities.${tabName}.${index}.place.coordinates.lat`}
                  className="border p-2 border-gray-300 w-full"
                />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <Label
                  htmlFor={`itinerary.activities.${tabName}.${index}.place.coordinates.lng`}
                  className="text-sm font-medium"
                >
                  经度
                </Label>
                <Input
                  type="number"
                  step="any"
                  {...register(`itinerary.activities.${tabName}.${index}.place.coordinates.lng` as const)}
                  placeholder="经度"
                  defaultValue={field.place?.coordinates?.lng}
                  id={`itinerary.activities.${tabName}.${index}.place.coordinates.lng`}
                  className="border p-2 border-gray-300 w-full"
                />
              </div>
            </div>

          </div>

        );
      })}

      {/* 按钮 */}
      <Button onClick={() => addNewControl(tabName)} variant="outline" className="text-center mt-2">
        <Plus /> 新增活动
      </Button>
    </TabsContent>
  );
}