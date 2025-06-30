import { GenerateThumbnailProps } from '@/types'
import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { Textarea } from '../ui/textarea';
import { Loader } from 'lucide-react';
import { Input } from '../ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { v4 as uuidv4 } from 'uuid';


const GenerateThumbnail = ({
  imgPrompt,  // 图像 prompt
  setImgPrompt,  // 设置图像 prompt
  imgURL,    // 图像 url
  setImage,  // 设置图像可访问的 url
  setImageStorageId,  // 设置图像存储 ID
} : GenerateThumbnailProps) => {
  
  const[isAIThumbnail, setIsAIThumbnail] = useState(false);
  const[isImageLoading, setIsImageLoading] = useState(false);  // 判断是否正在生成
  const imageRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)  // 生成 convex 云存储的上传 URL
  const {startUpload} = useUploadFiles(generateUploadUrl)  // 将 URL 传递给 useUploadFiles，实现从前端传输文件到 convex 云存储，会返回如 storageId 等信息
  const getImageUrl = useMutation(api.travelplan.getUrl)  // 根据 convex 的存储 ID 获取文件的访问 url
  const handleGenerateImage = useAction(api.openai.generateImage)  // 从 convex 加载文生图功能
  const {toast} = useToast();
  
  // AI 生成图像
  const generateImage = async () => {
    try {
      const response = await handleGenerateImage({ prompt: imgPrompt });  // 文生图
      const blob = new Blob([response], { type: 'image/png' });
      handleImage(blob, `thumbnail-${uuidv4()}`);  // 上传图像到 convex
    } catch (error) {
      console.log(error)
      toast({ title: '图像生成出错', variant: 'destructive'})
    }
  }  

  // 上传图像
  const uploadImage = async(e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      const files = e.target.files;  // 获取文件列表
      if (!files) return;
      const file = files[0];  // 读取第一个文件
      const blob = await file.arrayBuffer()  // 将文件转为二进制数据
      .then((ab) => new Blob([ab]));

      handleImage(blob, file.name);  // 将图像传到 convex 云存储
    } catch (error) {
      console.log(error)
      toast({ title: '上传图像出错', variant: 'destructive'})
    }
  }  

  // 将图像存储到后端数据库
  const handleImage = async(blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage('');

    try {
      const file = new File([blob], fileName, { type: 'image/png' });

      const uploaded = await startUpload([file]);  // 上传文件到 convex 的存储系统返回存储 ID
      const storageId = (uploaded[0].response as any).storageId;  // 获取 convex 存储 ID

      setImageStorageId(storageId);  // 设置图像的存储 ID
      const imageUrl = await getImageUrl({ storageId });  // 获取图像的 convex 可访问 url
      setImage(imageUrl!);  // 设置图像的访问 url
      setIsImageLoading(false);  // 图像加载完成
      // 弹窗显示生成成功
      toast({
        title: "图像存储成功",
      })
    } catch (error) {
      console.log(error)
      toast({ title: '图像存储出错', variant: 'destructive'})
    }
  }  

  return (
    <>
      <div className='generate_thumbnail'>
        <Button
          type='button'
          variant='plain'
          onClick={() => setIsAIThumbnail(true)}
          className={cn('',{'bg-white-1':isAIThumbnail})}
        >
            AI 生成图像
        </Button>

        <Button
          type='button'
          variant='plain'
          onClick={() => setIsAIThumbnail(false)}
          className={cn('',{'bg-white-1':!isAIThumbnail})}
        >
            上传图像
        </Button>

      </div>

      {isAIThumbnail ? (
        <div className='flex flex-col'>
          <div className='mt-5 flex flex-col gap-2.5'>
            <Label className="text-16 font-normal text-white-1">
              输入提示词生成图像
            </Label>
            <Textarea 
              rows={3}
              placeholder='请输入提示词'
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
            />
            {/* onClick 会调用图像生成的函数 generateImage */}
            <Button className='text-white-1 py-4 font-medium' onClick={generateImage}>
              {isImageLoading ? (
                <>
                  生成图像
                  <Loader size={20} className='animate-spin ml-2' />
                </>
              ): (
                '生成'
              )}
            </Button>
        
          </div>
        </div>
      ) : (
        <div className='image_div mt-5' onClick={() => imageRef?.current?.click()}>
            <Input
              type="file"
              className='hidden'
              ref={imageRef}
              onChange={(e) => uploadImage(e)}  // 上传图像
            />
            {!isImageLoading ? (
              <Image 
                src="/icons/upload.svg"
                width={40}
                height={40}
                alt='upload'
              />
            ) : (
              <div className='text-16 flex-center font-medium'>
                上传中...
                <Loader size={20} className='animate-spin' />
              </div>
            )}
            
            <div className='flex flex-col items-center gap-1'>
              <h2 className='text-12'>
                点击上传图像
              </h2>
              <p className='text-12'>SVG, PNG, JPG 或 GIF (最大 1080x1080px)</p>
            </div>

        </div>
      )}
      {imgURL && (
        <div className='flex-center w-full'>
          <Image
            src={imgURL}
            width={200}
            height={200}
            className='mt-5'
            alt="thumbnail"
          />
        </div>
      )}

    </>
  )
}

export default GenerateThumbnail