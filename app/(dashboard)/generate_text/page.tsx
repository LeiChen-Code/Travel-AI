"use client"
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useToast } from '@/hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'
import { useAction, useMutation } from 'convex/react'
import { Loader } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, convertToBase64 } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'

// 不同社交平台风格
const styleCategories = ['小红书', '朋友圈', '抖音'];
// 不同音色
const voiceCategories = ['longanrou', 'longqiang_v2', 'longhan_v2', 'longcheng_v2', 'longwan_v2'];

const GenerateText = () => {
  
  const [isImageLoading, setIsImageLoading] = useState(false);  // 判断图像是否正在上传
  const [imageURL, setImageURL] = useState('');  // 判断图像的临时访问 URL 是否存在
  const [base64URL, setBase64URL] = useState('');  // 判断图像的 base64 编码是否存在
  const imageRef = useRef<HTMLInputElement>(null);
  const {toast} = useToast();

  // 生成文案
  const [styleType, setStyleType] = useState<string | null>(null);  // 选择风格
  const [result, setResult] = useState<string | null>(null);  // 判断是否已生成文案
  const [textLoading, setTextLoading] = useState(false);  // 判断文案是否正在生成
  // 生成音频
  const [voiceType, setVoiceType] = useState<string | null>(null);  // 选择音色
  const [voicePrompt, setVoicePrompt] = useState('');  // 判断音频提示词是否输入
  const [voiceLoading, setVoiceLoading] = useState(false);  // 判断音频是否正在生成
  const [audioURL, setAudioURL] = useState('');  // 设置音频的临时访问 URL

  // 上传图像
  const uploadImage = async(e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setImageURL('');

    try {
      const files = e.target.files;  // 获取文件列表
      if (!files) return;
      const file = files[0];  // 读取第一个文件

      // 设置临时访问 url
      const imageUrl = URL.createObjectURL(file);  // 生成临时 URL
      setImageURL(imageUrl);

      handleImage(file); // !将图像转为 base64 编码

    } catch (error) {
      console.log(error)
      toast({ title: '上传图像出错', variant: 'destructive'})
    }
  }  

  // 将图像转为 base64 编码格式
  const handleImage = async(file: File) => {
    setIsImageLoading(true);
    setBase64URL('');

    try {
      // 调用工具函数将图像转换为 base64
      const base64Url = await convertToBase64(file);
      console.log("图像的 Base64 编码：", base64Url);

      setBase64URL(base64Url!);  // 设置图像的 base64 URL
      setIsImageLoading(false);  // 图像加载完成

      // 弹窗显示成功
      toast({
        title: "图像加载成功!",
      })
    } catch (error) {
      console.log('图像转换为 base64 编码出错',error);
    }
  }  
  
  // 图生文
  const generateCaption = useAction(api.openai.imageGenerateText);
  const handleGenerateText = async () => {
    if (!base64URL || !styleType) return;  // 保证图像已上传且文案风格已选择
    setTextLoading(true);  // 启动生成
    try {
      // 传入图像和风格
      const res = await generateCaption({ base64URL, style: styleType });
      setResult(res.text);  // 保存生成的文本
    } catch (e) {
      console.error("图生文失败", e);
    } finally {
      setTextLoading(false);
    }
  };

  // 文本转语音
  const generateVoice = async() => {
    setVoiceLoading(true);
    setAudioURL("");

    if (!voiceType) {
      toast({ title: "请先选择音色！" });
      return setVoiceLoading(false);
    }

    if(!voicePrompt){
        // 弹窗提示错误消息
        toast({
          title: "请提供生成音频的提示词，否则无法生成音频！",
        })
        return setVoiceLoading(false);
    }
    try {

      // 分割提示词文本为数组
      const texts = voicePrompt.split(/[，,。？！\n]/).filter(Boolean);

      // 调用 cosyvoice 模型实现文本转语音
      const response = await fetch("/api/CosyVoice", {
        method: "POST",
        body: JSON.stringify({ texts: texts, voiceType: voiceType }),
        headers: { "Content-Type": "application/json" },
      }); 
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const fileName = `tts-${uuidv4()}.mp3`;  // 文件名
      const file = new File([blob], fileName, { type: 'audio/mpeg' });  // 生成 mp3 文件

      // 设置音频临时访问 url
      const tmpUrl = URL.createObjectURL(file); 
      setAudioURL(tmpUrl);

      setVoiceLoading(false);  // 已经生成音频
      // 弹窗显示成功信息
      toast({
          title: "音频生成成功",
      })
    } catch (error) {
      // 打印报错
      console.log('文本转语音出错', error);
      // 弹窗报错
      toast({
          title: "生成音频出错",
          variant: "destructive",
      })
      setVoiceLoading(false);
    }

    return {
        voiceLoading, generateVoice
    }

  }

  // 清理之前的临时 URL
  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [imageURL, audioURL]);


  return (
    <div className="generate-text-container">
      
      {/* 左侧图像上传区域 */}
      <div className='left-section'>

        <div className='image_div' onClick={() => imageRef?.current?.click()}>
          <Input
            type="file"
            className='hidden'
            ref={imageRef}
            onChange={(e) => uploadImage(e)}  // 上传图像
          />

          {/* 根据图像是否正在上传返回不同状态 */}
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
        
        {/* 显示上传成功的图像 */}
        {imageURL && (
          <div className='relative flex-center w-full aspect-square'>
            <Image
              src={imageURL}
              fill
              className='object-contain mt-5'
              alt="thumbnail"
            />
          </div>
        )}

      </div>

      {/* 右侧生成文案及相关区域 */}
      <div className="right-section">

        <div className="generate-text-area flex-1 p-6">
        {/* 图生文 */}
          <div className="flex items-center justify-between mb-4 gap-4">
            {/* 选择框 */}
            <Select onValueChange={(value) => 
              setStyleType(value)}>

              <SelectTrigger className="text-16 bg-white-1">
                <SelectValue placeholder="选择风格" className="placeholder:text-gray-1"/>
              </SelectTrigger>

              <SelectContent className="text-16 bg-white-1">
                {styleCategories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize focus:bg-gray-200">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
              
            </Select>
          
            {/* 生成文本，如果没有上传图像，就是 disabled */}
            <Button disabled={textLoading || !base64URL} onClick={handleGenerateText} className="bg-blue-500 hover:bg-blue-700 text-white-1 font-medium py-2 px-16 rounded">
              {textLoading ? "生成中..." : "生成文案"}
            </Button>   

          </div>

          {result && (
            <div className='prose max-w-none p-4'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          )}

        </div>

        <div className="generate-audio-area flex-1" >
        {/* 文生语音 */}
          <div className="flex items-center justify-between mb-4 gap-4">
            {/* 选择框 */}
            <Select onValueChange={(value) => 
              setVoiceType(value)}>

              <SelectTrigger className='text-16 bg-white-1'>
                <SelectValue placeholder="选择音色" className="placeholder:text-gray-1"/>
              </SelectTrigger>

              <SelectContent className="text-16 bg-white-1">
                {voiceCategories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize focus:bg-gray-200">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>

              {/* 选择音色以后自动播放音频 */}
              {voiceType && (
                <audio src={`/audios/${voiceType}.mp3`} autoPlay className="hidden"/>
              )}

            </Select>

            {/* 生成音频按钮 */}
            <Button disabled={voiceLoading || !voicePrompt} onClick={generateVoice} className="bg-blue-500 hover:bg-blue-700 text-white-1 font-medium py-2 px-16 rounded">
              {voiceLoading ? "生成中..." : "生成音频"}
            </Button>   
          </div>
          
          {/* 输入生成音频的提示词 */}
          <Textarea
            className='input-class'
            placeholder='请输入文本以生成音频'
            rows={5}
            value={voicePrompt}
            onChange={(e) => setVoicePrompt(e.target.value)}  // 输入文本到提示词变量
          />
          
          {/* 播放音频 */}
          {audioURL && (
            <audio controls src={audioURL} className="w-full mt-4">
              Your browser does not support the audio element.
            </audio>
          )}
          
        </div>

      </div>
      
    </div>
  )
}

export default GenerateText