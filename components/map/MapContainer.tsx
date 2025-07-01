"use client"
import React from 'react'
import { useEffect, useRef } from "react";

const MapContainer = () => {

  const mapRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    
    if (typeof window === 'undefined' || !mapRef.current) return

    let map: any = null

    const initMap = async () => {
      try {
        const AMapLoader = await import('@amap/amap-jsapi-loader')
        // 加载地图 API
        const AMap = await AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY!,
          version: '2.0',
          plugins: ["AMap.ToolBar"], // 需要使用的插件列表
        })
        
        // 创建地图对象
        map = new AMap.Map(mapRef.current!, {
          viewMode: '2D',
          zoom: 11,
          center: [116.397428, 39.90923],  // 地图中心点，默认是首都北京
          mapStyle: "amap://styles/whitesmoke", //设置地图的显示样式
        })
        
        // 添加缩放工具到地图上
        var toolbar = new AMap.ToolBar();  // 创建工具条插件实例
        map.addControl(toolbar);  // 添加工具条到页面

      } catch (error) {
        console.error('地图初始化失败:', error)
      }
    }

    initMap()

    return () => {
      if (map) {
        map.destroy()
        map = null
      }
    }

  }, [])


  return (
    <div className='w-full h-[500px]'>
      <div ref={mapRef} id="container"  style={{ width: '100%', height: '500px' }} >
        
      </div>
    </div>
  );
}

export default MapContainer