import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const FURNISHING_ITEMS = [
  'AC', 'Fan', 'Light', 'Bed', 'Wardrobe', 'Geyser', 
  'Chimney', 'Fridge', 'Sofa', 'Dining Table', 'RO', 'Modular Kitchen'
];

const FurnishingSelector = ({ value = [], onChange }) => {
  const handleToggle = (item) => {
    const exists = value.find(v => v.item === item);
    if (exists) {
      onChange(value.filter(v => v.item !== item));
    } else {
      onChange([...value, { item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (item, delta, e) => {
    e.stopPropagation();
    onChange(value.map(v => {
      if (v.item === item) {
        const newQuantity = Math.max(1, Math.min(10, v.quantity + delta));
        return { ...v, quantity: newQuantity };
      }
      return v;
    }));
  };

  return (
    <div className="grid-4col-desktop">
      {FURNISHING_ITEMS.map((item) => {
        const selectedItem = value.find(v => v.item === item);
        const isSelected = !!selectedItem;

        return (
          <div 
            key={item}
            className={cn(
              "toggle-btn-base toggle-btn-compact relative overflow-hidden",
              isSelected ? "toggle-btn-on" : "toggle-btn-off"
            )}
            onClick={() => handleToggle(item)}
          >
            <span className="truncate w-full text-center z-10">{item}</span>
            
            {isSelected && (
              <div className="absolute inset-0 bg-primary flex items-center justify-between px-1 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    if (selectedItem.quantity === 1) {
                      e.stopPropagation();
                      handleToggle(item);
                    } else {
                      handleQuantityChange(item, -1, e);
                    }
                  }}
                  className="p-1 hover:bg-black/20 rounded text-white transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-xs text-white">
                  {selectedItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleQuantityChange(item, 1, e)}
                  disabled={selectedItem.quantity >= 10}
                  className="p-1 hover:bg-black/20 rounded text-white transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FurnishingSelector;