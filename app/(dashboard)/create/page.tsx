"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { number, z } from "zod"
 
import { toast, useToast } from "@/hooks/use-toast"
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
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"

const travelStyles = ['悠闲', '适中', '紧凑'];

const FormSchema = z.object({
  planTitle: z.string().min(2),
  travelPlace: z.string().min(2),
  travelPersons: z.number(),
  budget: z.number(),
})

const CreatePlan = () => {

    // 定义路由
    const router = useRouter();

    // 设置旅行模式，判断选项是否存在
    const [travelType, setTravelType] = useState<string | null>(null);

    // 判断日期
    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    })

    // 行程是否正在生成
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 判断生成图像的提示词是否存在
    const [imagePrompt, setImagePrompt] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);

    // 创建行程并将信息写入数据库
    const createPlan = useMutation(api.travelplan.createPlan)

    const { toast } = useToast();
    
    // 定义表单
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            planTitle: "",
            travelPlace:"",
            travelPersons: 1,
            budget: 0,
        },
    })
    
    // 定义 submit handler
    // 处理表单提交后的流程
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            setIsSubmitting(true);
            if(!imageURL || !imageStorageId){
                toast({
                    title: '请上传图像作为封面',
                    variant: 'destructive'
                })
                setIsSubmitting(false);
                throw new Error('请上传图像作为封面');
            }

            // 日期校验
            if (!range || !range.from || !range.to) {
                toast({
                    title: '请选择完整的日期范围',
                    variant: 'destructive'
                })
                setIsSubmitting(false);
                throw new Error("请选择完整的日期范围");
            }

            const plan = await createPlan({
                planTitle: data.planTitle,  // 行程标题
                travelPlace: data.travelPlace,  // 行程地点
                fromDate: range.from.getTime(),  // 转为时间戳
                toDate: range.to.getTime(),
                travelPersons: data.travelPersons,  // 同行人数
                travelType,  // 旅行模式
                budget: data.budget,  // 预算
                imageURL,  // 封面 url
                imageStorageId, // 封面存储 ID
            })

            toast({
                title:"行程创建成功！"
            })

            setIsSubmitting(false);

            // 创建行程后，跳转到生成行程的页面
            // 先跳转到历史行程页面进行测试
            router.push('/history')

        } catch (error) {
            console.log(error);
            toast({
                title: '创建行程出错',
                variant: 'destructive'
            })
            setIsSubmitting(false);
        }
    }

    return (
        // 行程标题、行程地点、行程日期、旅行人数、旅行模式、预算、行程封面
        <section className="flex flex-col px-10 mb-10">
            {/* <h1 className='text-20 font-bold text-black-1'>创建行程</h1> */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex w-full flex-col">
                    <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
                        <FormField
                            control={form.control}
                            name="planTitle"
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
                            
                            <DatePickerWithRange value={range} onChange={setRange} />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="travelPersons"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2.5">
                                <FormLabel className="text-16 font-medium">4.填写同行人数，只能填数字</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="填写旅行人数" {...field} 
                                        onChange={e => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
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
                                    <Input type="number" placeholder="填写预算" {...field} 
                                        onChange={e => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
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
                                setImgPrompt={setImagePrompt}
                                imgURL={imageURL}
                                setImage={setImageURL}
                                setImageStorageId={setImageStorageId}
                            />
                        </div>

                    </div>
                    
                    <Button type="submit" className="text-white-1">
                        创建行程
                        {/* {isSubmitting ? (
                            <>
                                <Loader size={20} className="animate-spin ml-2"/>
                                正在创建行程...
                            </>
                        ):(
                            '创建行程成功'
                        )} */}
                    </Button>
                </form>
            </Form>
        </section>
    )
}

export default CreatePlan

