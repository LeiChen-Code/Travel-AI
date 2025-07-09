
// 封装加载 AMap JSAPI 和 PlaceSearch 插件并返回其实例

export async function loadPlaceSearch(options?: { city?: string }) {
  if (typeof window === "undefined") {
    throw new Error("loadPlaceSearch can only be used in the browser.");
  }

  window._AMapSecurityConfig = {
    securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE!,
  };

  const AMapLoader = await import('@amap/amap-jsapi-loader').then(m => m.default);
  
  const AMap = await AMapLoader.load({
    key: process.env.NEXT_PUBLIC_AMAP_KEY!,
    version: '2.0',
    plugins: ["AMap.PlaceSearch"],
  });

  return new Promise<any>((resolve) => {
    AMap.plugin("AMap.PlaceSearch", () => {
      const ps = new AMap.PlaceSearch({
        ...options,
        citylimit: true,
        pageSize: 5,
        pageIndex: 1,
      });
      resolve(ps);
    });
  });
}
