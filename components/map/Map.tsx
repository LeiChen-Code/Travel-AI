'use client';
import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import { useMapContext } from '@/contexts/MapContext';

const MapComponent = () => {
  const { locations, selectedLocation } = useMapContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<AMap.Map | null>(null);
  const markersRef = useRef<Map<string, AMap.Marker>>(new Map()); // 用 Map 维护 name->Marker 映射

  // 1. 地图实例只初始化一次
  useEffect(() => {
    AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY!,
      version: '2.0',
      plugins: ['AMap.ToolBar'],
    }).then((AMap) => {

      if (mapRef.current && !mapInstance.current) {
        // 创建地图实例
        mapInstance.current = new AMap.Map(mapRef.current, {
          zoom: 11,
          center: locations[0]?.position || [116.397428, 39.90923],
        });
        // 创建工具条插件实例
        const toolbar = new AMap.ToolBar();
        if (mapInstance.current) {
            mapInstance.current.addControl(toolbar);  // 添加工具条到页面
        }
      }
    }).catch((e) => {
      console.error('地图加载失败', e);
    });

    return () => {
      mapInstance.current?.destroy();
      mapInstance.current = null;
      markersRef.current.clear();
    };
  }, []); // 依赖空数组，只初始化一次

  // 2. 根据 locations 增删 Marker，且不要重建地图
  useEffect(() => {
    if (!mapInstance.current) return;

    const existingMarkers = markersRef.current;

    // 先创建新 locations 的 marker（只创建不存在的）
    locations.forEach((loc) => {
      if (!existingMarkers.has(loc.name)) {
        // 实例化 marker
        const marker = new AMap.Marker({
          position: loc.position,
          title: loc.name,
        });
        marker.setMap(mapInstance.current!);

        // 为地图标记添加点击事件监听器，实现点击标记聚焦到该位置
        marker.on('click', () => {
          mapInstance.current?.setZoomAndCenter(15, marker.getPosition()!);
        });

        existingMarkers.set(loc.name, marker);
      } else {
        // 如果已经有，更新位置（如果需要）
        const marker = existingMarkers.get(loc.name)!;
        marker.setPosition(loc.position);
      }
    });

    // 删除 locations 不再存在的 marker
    existingMarkers.forEach((marker, name) => {
      if (!locations.find((loc) => loc.name === name)) {
        marker.setMap(null);
        existingMarkers.delete(name);
      }
    });

    const currentCenter = mapInstance.current.getCenter();
    const targetCenter = selectedLocation ? selectedLocation.position : locations[0]?.position;

    if (targetCenter) {
        const [lng, lat] = targetCenter;
        if (
        !currentCenter ||
        Math.abs(currentCenter.lng - lng) > 0.0001 ||
        Math.abs(currentCenter.lat - lat) > 0.0001
        ) {
        mapInstance.current.setZoomAndCenter(
            selectedLocation ? 16 : 11,
            targetCenter
        );
        }
    }
    
  }, [locations, selectedLocation]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;
