"use client"
import React from 'react'
import "@amap/amap-jsapi-types";

const Map = () => {

    const mapOptions: AMap.MapOptions = {
        center :[116.45, 39.92],
        zoom: 11,
    };

    // 创建地图对象
    const map = new AMap.Map('container',mapOptions);

    // 添加地图标记
    const circle :AMap.CircleMarker = new AMap.CircleMarker({
        center:[116.45, 39.92],
        radius: 30
    });

    map.add(circle);

    return (
        <div>Map</div>
    )
}

export default Map