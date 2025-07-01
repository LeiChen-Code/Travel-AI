import { httpAction } from "./_generated/server";

export const generateImage = httpAction(async (ctx, request) => {
    
    const { prompt } = await request.json();

    const apiKey = process.env.DASHSCOPE_API_KEY;

    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
            model: "wanx2.1-t2i-turbo",
            input: { prompt },
            parameters: {
                size: "500*500",
                n: 1,
            },
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({
        task_id: data.output?.task_id ?? null,
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});
