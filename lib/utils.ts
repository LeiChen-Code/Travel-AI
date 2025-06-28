import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 将浏览器中的 File 对象转为 base64 编码格式的字符串
export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // 创建 FileReader 实例

    // 文件读取完成时，会触发 onloadend 事件
    reader.onloadend = () => {
      const result = reader.result as string;  // 将 base64 编码结果转换为字符串
      resolve(result); // 通过 resolve 返回，形如 data:image/png;base64,...
    };

    // 文件读取过程若发生错误，触发 onerror 事件，通过 reject 返回错误信息
    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file); // 以 base64 编码形式异步读取文件内容
  });
}
