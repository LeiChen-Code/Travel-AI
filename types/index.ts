import { Id } from "@/convex/_generated/dataModel";

export interface GenerateThumbnailProps{
    imgPrompt:string,
    imgURL:string,
    setImgStorageId: Id<"_storage"> | null,
}

