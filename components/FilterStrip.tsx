
import React from 'react';
import { FILTERS } from '../constants';
import type { Filter } from '../types';

interface FilterStripProps {
  imageSrc: string;
  onSelectFilter: (filterName: string) => void;
}

const FilterPreview: React.FC<{ filter: Filter; imageSrc: string; onClick: () => void }> = ({ filter, imageSrc, onClick }) => {
  const filterStyle = {
    filter: [
      `brightness(${filter.edits.exposure ? filter.edits.exposure / 100 : 1})`,
      `contrast(${filter.edits.contrast ? filter.edits.contrast / 100 : 1})`,
      `saturate(${filter.edits.saturation ? filter.edits.saturation / 100 : 1})`,
      `sepia(${filter.edits.temperature && filter.edits.temperature > 0 ? filter.edits.temperature / 2 : 0}%)`,
      `hue-rotate(${filter.edits.temperature && filter.edits.temperature < 0 ? filter.edits.temperature * 1.5 : 0}deg)`,
    ].join(' '),
  };

  return (
    <div onClick={onClick} className="flex-shrink-0 text-center cursor-pointer group">
      <div className="w-20 h-20 bg-zinc-800 rounded-md overflow-hidden transform group-hover:scale-105 transition">
        <img src={imageSrc} alt={`${filter.name} preview`} className="w-full h-full object-cover" style={filterStyle} />
      </div>
      <p className="mt-1 text-xs font-medium text-zinc-300 group-hover:text-white transition">{filter.name}</p>
    </div>
  );
};

export const FilterStrip: React.FC<FilterStripProps> = ({ imageSrc, onSelectFilter }) => {
  return (
    <div className="flex items-center space-x-4 px-2 overflow-x-auto pb-2">
      {FILTERS.map(filter => (
        <FilterPreview key={filter.name} filter={filter} imageSrc={imageSrc} onClick={() => onSelectFilter(filter.name)} />
      ))}
    </div>
  );
};
