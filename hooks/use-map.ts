// hooks/useMap.ts
import { useEffect, useRef } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";

export const useMap = (ref: React.RefObject<HTMLDivElement>) => {
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;

    (window as any)._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
    };

    AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY!,
      version: "2.0",
      plugins: ["AMap.Scale"],
    }).then((AMap: any) => {
      mapInstance.current = new AMap.Map(ref.current!, {
        viewMode: "3D",
        zoom: 11,
        center: [116.397428, 39.90923],
      });
    });

    return () => {
      mapInstance.current?.destroy();
    };
  }, [ref]);

  return mapInstance;
};
