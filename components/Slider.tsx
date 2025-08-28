
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-zinc-300">{label}</label>
        <span className="text-xs text-zinc-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer range-sm accent-white"
      />
    </div>
  );
};
