"use client";
import { Input } from "@/components/ui/input";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { Loading } from "@/components/shared/Loading";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { formSchemaType } from "@/components/create/NewPlanForm";
import '@amap/amap-jsapi-types';
import { useAmapAutoComplete } from "@/hooks/useAmapAutoComplete";

// 此组件实现地点自动补充功能

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
  }
}

// 属性
type PlacesAutoCompleteProps = {
  selectedFromList: boolean;  // 表示用户是否已经从自动补全列表中选择了某个地点
  setSelectedFromList: Dispatch<SetStateAction<boolean>>;  // 用于更新 selectedFromList 的函数
  form: UseFormReturn<formSchemaType>; // 用于处理表单的校验、状态和提交
  field: ControllerRenderProps<formSchemaType, "travelPlace">;  // 专门管理行程地点字段的表单状态和事件
};

const PlacesAutoComplete = ({
  form,
  field,
  selectedFromList,
  setSelectedFromList,
}: PlacesAutoCompleteProps) => {

    // 表示是否显示自动补全的结果列表
    const [showResults, setShowResults] = useState(false);
    // 存储自动补全返回的地点预测结果，初始为空数组，后续会根据用户输入动态更新
    const [placePredictions, setPlacePredictions] = useState<any[]>([]);
    // 表示地点预测结果是否正在加载中，用于在加载过程中显示 loading 状态
    const [isPlacePredictionsLoading, setIsPlacePredictionsLoading] = useState(false);
    // 绑定输入
    const inputRef = useRef<HTMLInputElement>(null);
    // 通过 hook 获取自动补全插件
    const autoComplete = useAmapAutoComplete({ type: "190102|190103|190104" });

    // 处理用户从自动补全列表中选择某个地点时的逻辑
    const handleSelectItem = (
        e: MouseEvent<HTMLLIElement>,  // 点击事件对象
        description: string  // 被选中的地点
    ) => {
        e.stopPropagation();
        form.clearErrors("travelPlace");

        setShowResults(false);  // 隐藏自动补全结果列表
        setSelectedFromList(true);  // 标记用户已经从列表选择了一个地点

        form.setValue("travelPlace", description);  // 将选中的地点名称设置到表单中
    };

    // 处理用户在输入框中输入内容时的逻辑
    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;  // 获取用户当前输入的内容
        console.log("输入内容：", value);
        field.onChange(e.target.value);  // 将输入的值同步到表单状态

        if (value && autoComplete) {
        setIsPlacePredictionsLoading(true);  // 加载地点预测结果
        setShowResults(true);  // 显示自动补全结果列表

        // 触发查询，调用 search 成员方法
        autoComplete.search(value, (status: string, result: any) => {
            if (status === 'complete') {
                setPlacePredictions(result.tips || []);
                console.log("查询结果",result);
            } else {
                setPlacePredictions([]);
                if(status === 'error') {
                    console.error("地点补全查询出错", result);
                }
            }
            setIsPlacePredictionsLoading(false);
        });
        } else {
        setShowResults(false);
        setPlacePredictions([]);
        }
    };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="搜索地点..."
          onChange={handleSearch}
          onBlur={() => setShowResults(false)}
          value={field.value}
        />
        {isPlacePredictionsLoading && (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        )}
      </div>
      {showResults && (
        <div
          className="absolute w-full bg-white-1
        mt-2 shadow-md rounded-xl p-1 max-h-80 overflow-auto
        z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul
            className="w-full flex flex-col gap-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            {placePredictions.map((item) => (
              <li
                className="cursor-pointer
                flex justify-between items-center
                hover:bg-gray-100 hover:rounded-lg
                px-1 py-2 text-sm"
                onClick={(e) => handleSelectItem(e, item.name)}
                key={item.name}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlacesAutoComplete;