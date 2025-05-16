import { Id } from "@/convex/_generated/dataModel";
import { Dispatch, SetStateAction } from "react";

// 定义图像生成的属性
export interface GenerateThumbnailProps{
    imgPrompt:string,
    setImgPrompt:Dispatch<SetStateAction<string>>,
    imgURL:string,
    setImage: Dispatch<SetStateAction<string>>,
    setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>,
}

// 定义行程卡片组件的属性
export interface TravelCardProps{
    imgURL: string,
    title: string,
    fromDate: number,
    toDate: number,
    planId: Id<"planDetails"> | undefined,
}

