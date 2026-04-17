import React from 'react';
import { cn } from '@/lib/utils';

const AMENITIES_LIST = [
  'Parking', 'Garden', 'Balcony', 'Gym', 'Swimming Pool', 
  'Security', 'Lift', 'Intercom', 'Power Backup', 
  'Water Tank', 'Clubhouse', 'Playground'
];

const AmenitiesSelector = ({ value = [], onChange }) => {
  const handleToggle = (item) => {
    if (value.includes(item)) {
      onChange(value.filter(v => v !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="grid-3col-desktop">
      {AMENITIES_LIST.map((item) => {
        const isSelected = value.includes(item);

        return (
          <div 
            key={item}
            className={cn(
              "toggle-btn-base toggle-btn-compact",
              isSelected ? "toggle-btn-on" : "toggle-btn-off"
            )}
            onClick={() => handleToggle(item)}
          >
            <span className="truncate">{item}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AmenitiesSelector;