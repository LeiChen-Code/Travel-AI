"use client"
import React from 'react'
import { useState, useEffect, useRef } from "react";


const MapContainer = () => {

  const mapRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    
    if (typeof window === 'undefined' || !mapRef.current) return

    let map: any = null

    const initMap = async () => {
      try {
        const AMapLoader = await import('@amap/amap-jsapi-loader')
        const AMap = await AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY!,
          version: '2.0',
        })
        
        map = new AMap.Map(mapRef.current!, {
          viewMode: '3D',
          zoom: 11,
          center: [116.397428, 39.90923],
        })
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