import { Id } from "@/convex/_generated/dataModel";
import { Dispatch, SetStateAction } from "react";

export interface GenerateThumbnailProps{
    imgPrompt:string,
    setImgPrompt:Dispatch<SetStateAction<string>>,
    imgURL:string,
    setImage: Dispatch<SetStateAction<string>>,
    setImageStorageId: Dispatch<SetStateAction<Id<"_storage"> | null>>,
}

