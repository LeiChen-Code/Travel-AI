"use client";

import {useFieldArray} from "react-hook-form";
import {z} from "zod";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Plus, TrashIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {useZodForm} from "@/hooks/useZodForm";

// 此组件实现编辑列表功能

// 表单校验，要求列表项 items 包括 itemId 和 文本内容 text，且要求文本内容至少为 2 个字符
const validationSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      text: z.string().min(2),
    })
  ),
});

// 表示 items 数组中每个元素的类型
type ItemType = z.infer<typeof validationSchema>["items"][number];

type EditListProps = {
  arrayData: string[]; // 原始字符串数组
  handleToggleEditMode: () => void;  // 切换编辑状态方法
  updateData: (updatedArray: string[]) => void;  // 更新列表数据方法
};

const EditList = ({arrayData, handleToggleEditMode, updateData}: EditListProps) => {
  // 遍历 arrayData，转换为 items 对象
  const [items, setItems] = useState<ItemType[]>(() =>
    arrayData.map((item, index) => {
      return {
        itemId: index.toString(),
        text: item,
      };
    })
  );

  // 创建表单实例，返回一组表单操作或状态
  const {
    handleSubmit,  
    register,
    control,
    getFieldState,
    formState: {isValid, errors, isDirty},
  } = useZodForm({
    schema: validationSchema,
    defaultValues: {items},
    mode: "onTouched",
  });

  // 管理表单中的动态数组字段，返回值：fields 包括表项的状态和数据，append 表示新增表项方法，remove 表示删除表项方法
  const {fields, append, remove} = useFieldArray({
    name: "items",
    control,
  });

  // 定义在表单的动态列表中新增表项的方法
  const addNewControl = () => {
    append(
      {
        itemId: "new",
        text: "",
      },
      {
        shouldFocus: false,
      }
    );
  };

  // isSubmittable 表示 保存 按钮是否可用
  // isDirty 表示表单内容是否被修改过，isValid 表示表单是否通过了校验
  const isSubmittable = !!isDirty && !!isValid;

  // 表单提交时的回调函数
  const onSaveEditList = (data: {items: ItemType[]}) => {
    // 提取所有表单内容
    const updatedArray = data.items.map((item) => item.text);
    // 更新到 convex 数据库
    updateData(updatedArray);
  };

  return (
    <div className="w-2/3">
      <form onSubmit={handleSubmit(onSaveEditList)} className="flex flex-col gap-1">
        {/* 展示可编辑的动态列表表单 */}
        {fields.map((field, index) => {
          // 获取输入框的校验错误信息
          const errorForField = errors?.items?.[index]?.text;
          // 获取该字段的状态，如是否被修改
          const state = getFieldState(`items.${index}.text`);

          return (
            <div className="flex gap-5 w-full justify-center items-center" key={field.id}>
              <div className="flex-1 flex-col gap-2 flex justify-center items-center">
                {/* 一个列表项对应一个输入框 */}
                <Input
                  {...register(`items.${index}.text` as const)}
                  placeholder="输入美食"
                  defaultValue={field.text}
                  className={cn(
                    "border p-2 border-gray-300 w-full",
                    state.isTouched && errorForField && "border-red-500 border-2"  // 如果该表项被触碰且有错误，边框变为红色，提示用户输入不合法
                  )}
                />
                {/* 如果输入框存在错误信息，会显示一条红色的错误提示，例如输入的字符少于 2 个 */}
                {errorForField?.message && !state.isTouched && (
                  <p className="text-sm font-thin text-red-400">
                    {state.isDirty && errorForField?.message}
                  </p>
                )}
              </div>
              
              {/* 每个表项右侧有一个垃圾桶按钮，表示删除表项 */}
              <Button
                className="text-gray-2 items-center rounded-md p-3"
                variant="outline"
                size="lg"
                onClick={() => remove(index)}
              >
                <TrashIcon className="w-6 h-6" />
              </Button>
            </div>
          );
        })}

        {/* 新增、保存、取消按钮 */}
        <div className="flex justify-between gap-2 mt-5 w-[90%]">
          <Button onClick={addNewControl} variant="outline" className="text-center">
            <Plus /> 新增表项
          </Button>
          <div className="flex gap-2 justify-between">
            {/* 只有表单被修改且校验通过时，保存按钮才会生效 */}
            <Button disabled={!isSubmittable} size="sm" variant="outline">
              保存
            </Button>
            <Button onClick={handleToggleEditMode} size="sm" variant="outline">
              取消
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditList;