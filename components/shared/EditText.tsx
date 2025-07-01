import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

// 此组件实现编辑文本内容功能

// 表单校验，要求文本内容必须为非空字符串，否则进行提示
const formSchema = z.object({
  textContent: z.string().min(1, "文本内容必须非空"),
});

// 由父组件传递过来的参数
type EditTextProps = {
  content: string | undefined;  // 文本内容
  toggleEditMode: () => void;  // 切换编辑模式方法
  updateContent: (content: string) => void;  // 内容更新方法
};

const EditText = ({
  content,
  toggleEditMode,
  updateContent,
}: EditTextProps) => {
  // 管理文本内容
  const [textContent, setTextContent] = useState(content || "");
  // 实现表单状态管理和校验
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textContent,  
    },
  });

  // 定义提交表单操作
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // 将文本内容提交
    updateContent(values.textContent);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-2">
        {/* 将文本内容 textContent 和表单状态绑定 */}
        <FormField
          control={form.control}
          name="textContent"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="填写关于该地点的介绍"
                  {...field}
                  rows={5}
                  className="h-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 两个按钮：保存内容、取消编辑，取消编辑时触发切换编辑模式的方法 */}
        <div className="flex gap-2 items-center">
          <Button type="submit" variant="outline" size="sm">
            保存
          </Button>
          <Button onClick={toggleEditMode} size="sm" variant="outline">
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditText;