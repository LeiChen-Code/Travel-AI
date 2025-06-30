// travel-planner-ai/components/PlacesAutoComplete.tsx
"use client";
import { Input } from "@/components/ui/input";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Loading } from "@/components/shared/Loading";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { formSchemaType } from "@/components/create/NewPlanForm";
import AMapLoader from '@amap/amap-jsapi-loader';

type PlacesAutoCompleteProps = {
  selectedFromList: boolean;
  setSelectedFromList: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<formSchemaType, any, undefined>;
  field: ControllerRenderProps<formSchemaType, "travelPlace">;
};

const PlacesAutoComplete = ({
  form,
  field,
  selectedFromList,
  setSelectedFromList,
}: PlacesAutoCompleteProps) => {
  const [showResults, setShowResults] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<any[]>([]);
  const [isPlacePredictionsLoading, setIsPlacePredictionsLoading] = useState(false);
  const [autoComplete, setAutoComplete] = useState<any | null>(null);

  useEffect(() => {
    const loadAMap = async () => {
      try {
        const AMap = await AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY!,
          version: '2.0',
          plugins: ['Autocomplete']
        });

        const autoCompleteInstance = new AMap.Autocomplete({
          input: field.ref as unknown as HTMLInputElement,
          type: '(regions)'
        });

        setAutoComplete(autoCompleteInstance);

        autoCompleteInstance.on('complete', (data: any) => {
          setIsPlacePredictionsLoading(false);
          setPlacePredictions(data.poiList.pois);
        });

        autoCompleteInstance.on('error', () => {
          setIsPlacePredictionsLoading(false);
          setPlacePredictions([]);
        });
      } catch (error) {
        console.error('加载高德地图 API 失败:', error);
      }
    };

    loadAMap();

    return () => {
      if (autoComplete) {
        autoComplete.destroy();
      }
    };
  }, [field.ref]);

  const hadleSelectItem = (
    e: MouseEvent<HTMLLIElement>,
    description: string
  ) => {
    e.stopPropagation();
    form.clearErrors("travelPlace");

    setShowResults(false);
    setSelectedFromList(true);

    form.setValue("travelPlace", description);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    field.onChange(e.target.value);

    if (value) {
      setIsPlacePredictionsLoading(true);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="搜索地点..."
          onChange={handleSearch}
          onBlur={() => setShowResults(false)}
          value={field.value}
        />
        {isPlacePredictionsLoading && (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        )}
      </div>
      {showResults && (
        <div
          className="absolute w-full
        mt-2 shadow-md rounded-xl p-1 bg-background max-h-80 overflow-auto
        z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul
            className="w-full flex flex-col gap-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            {placePredictions.map((item) => (
              <li
                className="cursor-pointer
                border-b 
                flex justify-between items-center
                hover:bg-muted hover:rounded-lg
                px-1 py-2 text-sm"
                onClick={(e) => hadleSelectItem(e, item.name)}
                key={item.id}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlacesAutoComplete;