import { useEffect, useState } from "react";

// 将“加载高德地图 JSAPI 和实例化 AutoComplete 插件”的过程封装成自定义 hook
// 可传入 type 参数，限制搜索的类型

export function useAmapAutoComplete(options?: { type?: string }) {
  const [autoComplete, setAutoComplete] = useState<any | null>(null);

  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE!,
    };

    // 动态导入，避免 SSR 报错
    import('@amap/amap-jsapi-loader').then(({ default: AMapLoader }) => {
      // 加载高德地图
      AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY!,
        version: '2.0',
        plugins: ["AMap.AutoComplete"],
      }).then((AMap) => {
        AMap.plugin("AMap.AutoComplete", () => {
          // 加载插件
          const ac = new AMap.AutoComplete({
            ...options,
          });
          setAutoComplete(ac);
        });
      });
    });
    
    return () => {
      if (autoComplete) autoComplete.destroy?.();
    };
    
  }, []);

  return autoComplete;
}