import { Location } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// 让不同的组件能共享上下文(地图数据)

// 定义上下文类型
// 包含地点列表、设置地点列表的函数、选中的地点和设置选中的函数
interface MapContextType {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  const value = useMemo(() => ({ 
    locations, 
    setLocations, 
    selectedLocation,
    setSelectedLocation, 
  }), [locations, selectedLocation]);
  
  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};
