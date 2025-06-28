export const runtime = 'nodejs'; // 明确声明此 API 路由只能在 Node.js 环境下运行。

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';


// 将文本通过阿里云 DashScope 的 CosyVoice 语音合成（TTS）服务转为音频，并以 mp3 格式返回

// POST 请求处理函数
export async function POST(req: NextRequest) {

  const { WebSocket } = await import("ws");  // 动态导入

  // 解析请求体，获取文本 texts 和音色 voiceType
  const { texts, voiceType } = await req.json();
  console.log('[TTS] 接收到请求参数:', { texts, voiceType });

  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: 'Missing text array 提示词文本丢失' }, { status: 400 });
  }

  // 获取 DashScope API Key
  const apiKey = process.env.DASHSCOPE_API_KEY;
  // 生成唯一的任务 ID
  const taskId = uuidv4();
  // WebSocket服务器地址
  const wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
  // 用于收集音频二进制片段的数组
  const audioChunks: Buffer[] = [];

  // WebSocket 连接与 TTS 任务流程
  return new Promise((resolve, reject) => {

    // 创建 WebSocket 客户端，建立 WebSocket 连接，带上鉴权头
    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `bearer ${apiKey}`,
        'X-DashScope-DataInspection': 'enable'
      }
    });

    // 开启任务
    ws.on('open', () => {
      console.log('[TTS] WebSocket 已连接，发送 run-task...');
      // 发送 run-task 指令，初始化 TTS 任务
      ws.send(JSON.stringify({
        header: { action: 'run-task', task_id: taskId, streaming: 'duplex' },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: 'cosyvoice-v2',  // 调用 cosyvoice 模型
          parameters: {
            text_type: 'PlainText',
            voice: voiceType,  // 音色
            format: 'mp3',  // 音频格式
            sample_rate: 22050,  // 采样率
            volume: 50, // 音量
            rate: 1,  // 语速
            pitch: 1  // 音调
          },
          input: {}
        }
      }));
    });

    // 处理 WebSocket 消息
    ws.on('message', (data, isBinary) => {

      if (isBinary) {

        // 如果收到的是二进制数据（音频片段），则收集到音频数组 audioChunks 中
        audioChunks.push(Buffer.from(data as ArrayBuffer));
      
      } else {

        // 如果收到的是 JSOB 消息，根据 event 字段判断阶段
        const msg = JSON.parse(data.toString());
        const event = msg?.header?.event;

        // 任务起始阶段
        if (event === 'task-started') {
          // 分段发送文本
          texts.forEach((text, i) => {
            setTimeout(() => {
              ws.send(JSON.stringify({
                header: { action: 'continue-task', task_id: taskId, streaming: 'duplex' },
                payload: { input: { text } }
              }));
            }, i * 500);
          });


          // 最后发送 finish-task，请求结束语音合成任务
          setTimeout(() => {
            console.log('[TTS] 发送 finish-task');
            ws.send(JSON.stringify({
              header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' },
              payload: { input: {} }
            }));
          }, texts.length * 500 + 500);
        }

        // 终止任务
        if (event === 'task-finished') {
          console.log('[TTS] 任务完成，关闭连接并返回 mp3 音频');
          // 关闭连接
          ws.close();
          // 把所有音频片段合并为一个 Buffer，作为 mp3 返回
          const finalAudio = Buffer.concat(audioChunks);
          resolve(
            new NextResponse(finalAudio, {
              status: 200,
              headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'inline; filename="tts.mp3"'
              }
            })
          );
        }

        // 任务失败
        if (event === 'task-failed') {
          console.error('[TTS] 任务失败！完整错误信息：', JSON.stringify(msg, null, 2));
          ws.close();  // 关闭连接
          // 返回错误消息
          reject(
            new NextResponse(
              JSON.stringify({ error: msg?.header?.error_message || 'TTS failed' }),
              { status: 500 }
            )
          );
        }
      }
    });

    // 错误处理，如果 WebSocket 连接出错，返回 500 错误
    ws.on('error', (err) => {
      console.error('[TTS] WebSocket 连接出错:', err);
      reject(NextResponse.json({ error: err.message }, { status: 500 }));
    });
  });
}
