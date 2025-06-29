import {Dispatch, SetStateAction} from "react";
import {z} from "zod";
import {useMutation} from "convex/react";

import {Button} from "@/components/ui/button";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

import useItineraryForm from "@/hooks/useItineraryForm";

import {ItineraryValidationSchema} from "@/components/addNewItineraryDay/ItineraryValidationSchema";

import {api} from "@/convex/_generated/api";
import {Doc, Id} from "@/convex/_generated/dataModel";

import {Sun, Sunrise, Sunset} from "lucide-react";
import CustomTabContent from "@/components/addNewItineraryDay/CustomTabContent";

export type ItineraryType = z.infer<typeof ItineraryValidationSchema>["itinerary"];

type ItineraryDayFormProps = {
  planId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ItineraryDayForm = ({planId, setOpen}: ItineraryDayFormProps) => {
  const {
    register,
    handleSubmit,
    handleTabChange,
    morningFields,
    afternoonFields,
    eveningFields,
    addNewControl,
    getFieldState,
    removeMorning,
    removeAfternoon,
    removeEvening,
    isValid,
    errors,
    isDirty,
  } = useItineraryForm(planId);

  // 调用 addDayInItinerary 接口定义 修改行程表 的函数
  const updateItinerary = useMutation(api.travelplan.addDayInItinerary);

  // 保存行程操作
  const onSaveEditList = (data: {itinerary: ItineraryType}) => {
    if (!planId) return;
    if (
      data.itinerary.activities.morning.length === 0 &&
      data.itinerary.activities.afternoon.length === 0 &&
      data.itinerary.activities.evening.length === 0
    )
      return;
    
    // !报错，因为新增一天的时候，没有添加地点 
    updateItinerary({
      planId: planId as Id<"planDetails">,
      itineraryDay: data.itinerary,
    }).then((_) => setOpen(false));
  };

  return (
    <form onSubmit={handleSubmit(onSaveEditList)} className="bg-white-1 flex flex-col gap-1">
      <h2 className="bg-white-1 font-medium">新增一天</h2>
      <Tabs defaultValue="morning" className="" onValueChange={handleTabChange}>

        <TabsList>
          <TabsTrigger value="morning">
            <Sunrise className="w-4 h-4 text-blue-500 mr-2" /> 早上
          </TabsTrigger>
          <TabsTrigger value="afternoon">
            <Sun className="w-4 h-4 text-yellow-500 mr-2" /> 下午
          </TabsTrigger>
          <TabsTrigger value="evening">
            <Sunset className="w-4 h-4 text-gray-600 mr-2" /> 晚上
          </TabsTrigger>
        </TabsList>

        <CustomTabContent
          fields={morningFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="morning"
          register={register}
          remove={removeMorning}
        />

        <CustomTabContent
          fields={afternoonFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="afternoon"
          register={register}
          remove={removeAfternoon}
        />

        <CustomTabContent
          fields={eveningFields}
          addNewControl={addNewControl}
          errors={errors}
          getFieldState={getFieldState}
          tabName="evening"
          register={register}
          remove={removeEvening}
        />
      </Tabs>

      <div className="flex justify-start items-center gap-2 mt-5">
        <Button size="sm" variant="outline" disabled={!isValid && isDirty}>
          保存
        </Button>
        <Button onClick={() => setOpen(false)} size="sm" variant="outline">
          取消
        </Button>
      </div>
    </form>
  );
};

export default ItineraryDayForm;