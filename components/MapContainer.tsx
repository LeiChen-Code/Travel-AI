"use client"
import React from 'react'
import { useRef } from "react";
import { useMap } from '@/hooks/use-map';

// ✅ 建议你把密钥存在 .env.local 中，并通过 process.env 引用
const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY!;
const AMAP_SECURITY_JS_CODE = process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE;

// 声明?
declare namespace AMap {
  class Map {
    constructor(container: string | HTMLDivElement, options: any);
    destroy(): void;
  }
}


const MapContainer = () => {
  
  const mapRef = useRef<HTMLDivElement>(null);
  useMap(mapRef);

  return (
    <div
      id="container"
      className="container"
      style={{ height: "800px" }}
    >
    </div>
  )
}

export default MapContainer