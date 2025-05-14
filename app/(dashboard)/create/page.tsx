"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/DateRangePicker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState } from "react"
import GenerateThumbnail from "@/components/GenerateThumbnail"
import { Loader } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

const travelStyles = ['悠闲', '适中', '紧凑'];

const FormSchema = z.object({
  PlanTitle: z.string().min(2),
  travelPlace: z.string().min(2),
  travelPersons: z.number(),
  budget: z.number(),
})

const CreatePlan = () => {

    // 设置表单状态，判断选项是否存在
    const [travelType, setTravelType] = useState<string | null>(null);

    // 行程是否正在生成
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 判断生成图像的提示词是否存在
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            PlanTitle: "",
            travelPlace:"",
            travelPersons: 1,
            budget: 0,
        },
    })
    
    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
        title: "You submitted the following values:",
        description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
            </pre>
        ),
        })
    }
    return (
        // 行程标题、行程地点、行程日期、旅行人数、旅行模式、预算、行程封面
        <section className="flex flex-col">
            {/* <h1 className='text-20 font-bold text-black-1'>创建行程</h1> */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex w-full flex-col">
                    <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
                        <FormField
                            control={form.control}
                            name="PlanTitle"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2.5">
                                <FormLabel className="text-16 font-medium">1.创建行程标题</FormLabel>
                                <FormControl>
                                    <Input placeholder="填写行程标题" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="travelPlace"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2.5">
                                <FormLabel className="text-16 font-medium">2.填写行程目的地</FormLabel>
                                <FormControl>
                                    <Input placeholder="填写行程目的地" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2.5">
                            <Label className="text-16 font-medium">
                                3.选择行程日期
                            </Label>
                            <DatePickerWithRange/>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="travelPersons"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2.5">
                                <FormLabel className="text-16 font-medium">4.填写同行人数，只能填数字</FormLabel>
                                <FormControl>
                                    <Input placeholder="填写旅行人数" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2.5">
                            <Label className="text-16 font-medium">
                                5.选择旅行模式
                            </Label>
                            <Select
                                onValueChange={(value) => setTravelType(value)}  // 存入变量 travelType
                            >
                                <SelectTrigger className={cn('text-16 w-full')}>
                                    <SelectValue placeholder="旅行模式" />
                                </SelectTrigger>
                                <SelectContent className="text-16  bg-white-1">
                                    {travelStyles.map((category) => (
                                        <SelectItem
                                            key={category} 
                                            value={category}
                                            className="capitalize focus:bg-gray-300"
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2.5">
                                <FormLabel className="text-16 font-medium">6.填写预算，单位为元，只能填数字</FormLabel>
                                <FormControl>
                                    <Input placeholder="填写预算" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2.5">
                            <Label className="text-16 font-medium">
                                7.创建行程封面
                            </Label>
                            {/* 生成封面 */}
                            <GenerateThumbnail
                                imgPrompt={imagePrompt}
                                imgURL={imageURL}
                                setImgStorageId={imageStorageId}
                            />
                        </div>

                    </div>
                    
                    <Button type="submit" className="text-white-1">
                        创建行程
                        {/* {isSubmitting ? (
                            <>
                                <Loader size={20} className="animate-spin ml-2"/>
                                正在生成...
                            </>
                        ):(
                            '生成成功，点击跳转'
                        )} */}
                    </Button>
                </form>
            </Form>
        </section>
    )
}

export default CreatePlan

