'use client';
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import { useMapContext } from '@/contexts/MapContext';

const Map = () => {
    // 根据上下文获取 locations
    const { locations, selectedLocation } = useMapContext();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<AMap.Map | null>(null);
    const markersRef = useRef<AMap.Marker[]>([]);
    
    useEffect(() => {
        AMapLoader.load({
            key: process.env.NEXT_PUBLIC_AMAP_KEY!, // 高德地图 API Key
            version: '2.0',
            plugins: ["AMap.ToolBar"],  // 需要使用的插件，即缩放按钮
        })
        .then((AMap) => {
            if (mapRef.current) {
                mapInstance.current = new AMap.Map(mapRef.current, {
                    zoom: 11,
                    center: locations[0]?.position || [116.397428, 39.90923],
                });

                // 添加缩放工具到地图上
                const toolbar = new AMap.ToolBar();  // 创建工具条插件实例
                if (mapInstance.current) {
                    mapInstance.current.addControl(toolbar);  // 添加工具条到页面
                }

                // 地图标记
                const markers: AMap.Marker[] = locations.map((loc) => {
                    const marker = new AMap.Marker({
                        position: loc.position,
                        title: loc.name,
                    });
                    marker.setMap(mapInstance.current!);
                    
                    // 为地图标记添加点击事件监听器，实现点击标记聚焦到该位置
                    marker.on('click', () => {
                        mapInstance.current?.setZoomAndCenter(15, marker.getPosition()!);
                    });

                    return marker;
                });

                markersRef.current = markers;

                if (selectedLocation && mapInstance.current) {
                    mapInstance.current.setZoomAndCenter(16, selectedLocation.position);
                }
            }
        })
        .catch((e) => {
            // todo: 添加 toaster
            console.error('地图加载失败', e); 
        });

        return () => {
            // 销毁当前已经存在的地图实例，释放地图实例占用的资源
            mapInstance.current?.destroy(); 
        };
    }, [locations, selectedLocation]);

    // 点击地名聚焦到地图
    // useEffect(() => {
    //     if (selectedLocation && mapInstance.current) {
    //     mapInstance.current.setZoomAndCenter(15, selectedLocation.position);
    //     }
    // }, []);

    return(
        <div className='w-full h-full'>
            <div ref={mapRef}  style={{ width: '100%', height: '100%' }} />
        </div>
    )
};

export default Map;
