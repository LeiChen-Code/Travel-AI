import { useEffect, useState } from "react";

// 将“加载高德地图 JSAPI 和实例化 PlaceSearch 插件”的过程封装成自定义 hook
// 传入 city 参数，限制搜索的城市

export function usePlaceSearch(options?: { city?: string }) {
    // 设置插件实例
    const [placeSearch, setPlaceSearch] = useState<any | null>(null);

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
                plugins: ["AMap.PlaceSearch"],
            }).then((AMap) => {
                // 加载插件
                AMap.plugin("AMap.PlaceSearch", () => {
                    // 实例化插件
                    const ps = new AMap.PlaceSearch({
                        ...options,
                        citylimit: true,  //是否强制限制在设置的城市内搜索
                        pageSize: 5, // 每页结果数
                        pageIndex: 1, // 请求页码
                    });
                    setPlaceSearch(ps); // 设置插件实例
                });
            });
        });
        
        return () => {
            if (placeSearch) placeSearch.destroy?.();
        };
        
    }, [options]);

    return placeSearch;
}