import { ItineraryValidationSchema } from "@/components/Itinerary/ItineraryValidationSchema";
import { useZodForm } from "@/hooks/useZodForm";
import { useRef } from "react";
import { useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { ItineraryType } from "@/components/Itinerary/ItineraryDayForm";
import { z } from "zod";

const useItineraryForm = (planId: string, initialItinerary?: ItineraryType) => {

    const ref = useRef({
        afternoon: false,
        evening: false,
    });

    // 定义一项空活动
    const emptyActivity = {
        itineraryItem: "",
        briefDescription: "",
        place: {
            name: "",
            coordinates: {
                lat: 0,
                lng: 0,
            },
        },
    };

    // 默认的一天行程
    const defaultItinerary = initialItinerary ?? {
        title: "新的一天",
        activities: {
            morning: [emptyActivity],
            afternoon: [],
            evening: [],
        },
    };


    // 创建一个表单实例
    const {
        handleSubmit,  // 表单提交处理函数
        register,
        control,
        getFieldState,
        formState: { isValid, errors, isDirty },
    } = useZodForm({
        schema: ItineraryValidationSchema,  // 指定表单的校验规则
        defaultValues: {  // 设置表单的初始值
            itinerary: defaultItinerary,
        },
        mode: "onTouched",  // 字段在被触碰后才会触发校验
    });

    // 利用 useFieldArray 钩子，分别为“早上”、“下午”和“晚上”三个时间段的活动数组建立了动态表单字段管理
    // append 方法用于增加活动，remove 方法用于删除活动
    const {
        fields: morningFields,
        append: appendMorning,
        remove: removeMorning,
    } = useFieldArray({
        name: "itinerary.activities.morning",
        control,
    });

    const {
        fields: afternoonFields,
        append: appendAfternoon,
        remove: removeAfternoon,
    } = useFieldArray({
        name: "itinerary.activities.afternoon",
        control,
    });

    const {
        fields: eveningFields,
        append: appendEvening,
        remove: removeEvening,
    } = useFieldArray({
        name: "itinerary.activities.evening",
        control,
    });

    // 用于在表单的动态活动数组中添加新的活动项
    const addNewControl = (fieldArrayName: string) => {
        switch (fieldArrayName) {
            case "morning":
                appendMorning(emptyActivity);
                break;
            case "afternoon":
                appendAfternoon(emptyActivity, {
                    shouldFocus: false,
                    focusIndex: -1
                });
                break;
            case "evening":
                appendEvening(emptyActivity);
                break;
            default:
                break;
        }
    };

    // 响应用户切换表单 Tab 时的处理逻辑
    const handleTabChange = (value: string) => {
        switch (value) {
            case "afternoon": {
                // 只有在用户第一次切换到“下午”或“晚上”Tab 时，才自动为该时间段添加一个初始活动项，避免重复添加
                if (!ref.current.afternoon) {
                    ref.current.afternoon = true;
                    appendAfternoon(emptyActivity);
                }
                break;
            }
            case "evening": {
                if (!ref.current.evening) {
                    ref.current.evening = true;
                    appendEvening(emptyActivity);
                }
                break;
            }

            default:
                break;
        }
    };

    return (
        {
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
        }
    )
}


export default useItineraryForm