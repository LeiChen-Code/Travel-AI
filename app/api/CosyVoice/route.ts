import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';

export const runtime = 'nodejs'; // 确保用 Edge Runtime 会失败

export async function POST(req: NextRequest) {
  const { texts } = await req.json();

  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: 'Missing text array' }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  const taskId = uuidv4();

  // WebSocket服务器地址
  const wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';

  const audioChunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    // 创建 WebSocket 客户端
    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `bearer ${apiKey}`,
        'X-DashScope-DataInspection': 'enable'
      }
    });

    ws.on('open', () => {
      // 1. 发送 run-task 指令
      ws.send(JSON.stringify({
        header: { action: 'run-task', task_id: taskId, streaming: 'duplex' },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: 'cosyvoice-v2',  // 调用 cosyvoice 模型
          parameters: {
            text_type: 'PlainText',
            voice: 'longxiaochun_v2',  // 音色
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

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        audioChunks.push(Buffer.from(data));
      } else {
        const msg = JSON.parse(data.toString());
        const event = msg?.header?.event;

        if (event === 'task-started') {
          // 2. 发送 continue-task 文本
          texts.forEach((text, i) => {
            setTimeout(() => {
              ws.send(JSON.stringify({
                header: { action: 'continue-task', task_id: taskId, streaming: 'duplex' },
                payload: { input: { text } }
              }));
            }, i * 500);
          });

          // 3. 最后发送 finish-task
          setTimeout(() => {
            ws.send(JSON.stringify({
              header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' },
              payload: { input: {} }
            }));
          }, texts.length * 500 + 500);
        }

        if (event === 'task-finished') {
          ws.close();

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

        if (event === 'task-failed') {
          ws.close();
          reject(
            new NextResponse(
              JSON.stringify({ error: msg?.header?.error_message || 'TTS failed' }),
              { status: 500 }
            )
          );
        }
      }
    });

    ws.on('error', (err) => {
      reject(NextResponse.json({ error: err.message }, { status: 500 }));
    });
  });
}
