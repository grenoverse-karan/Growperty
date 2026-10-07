import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Photo slider for listing cards: < > arrows (hover on desktop, always visible
// on touch screens), dots, and swipe. Only the first photo is loaded up front;
// the rest are fetched once the visitor hovers/touches the card, one slide
// ahead of where they are — a feed of 20 cards must not fetch 100 photos.
//
// images       — srcs we already have (index-aligned); usually just the cover
// count        — total number of photos
// getUrl(i)    — src for photo i when we don't have it yet
// dotsBottom   — px from the bottom, to clear overlays such as the offer strip
// dotsTop      — place the dots this many px from the top instead
export default function ImageSlider({ images = [], count = 0, getUrl, alt = '', dotsBottom = 8, dotsTop = null, grayscale = false }) {
  const total = Math.max(count, images.length, 1);
  const [idx, setIdx] = useState(0);
  const [armed, setArmed] = useState(false);
  const touchX = useRef(null);

  const srcFor = (i) => images[i] || ((armed || i === 0) && getUrl ? getUrl(i) : null);
  const shouldLoad = (i) => i === 0 || (armed && i <= idx + 1);

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setArmed(true);
    setIdx(i => Math.min(total - 1, Math.max(0, i + dir)));
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => total > 1 && setArmed(true)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; if (total > 1) setArmed(true); }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(e, dx < 0 ? 1 : -1);
      }}
    >
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out group-hover:scale-105"
        style={{ transform: `translateX(-${idx * 100}%)`, transitionProperty: 'transform' }}
      >
        {Array.from({ length: total }, (_, i) => {
          const src = shouldLoad(i) ? srcFor(i) : null;
          return (
            <div key={i} className="h-full w-full shrink-0 bg-slate-100 dark:bg-slate-800">
              {src && (
                <img
                  src={src}
                  alt={i === 0 ? alt : `${alt} - photo ${i + 1}`}
                  className={`h-full w-full object-cover ${grayscale ? 'grayscale' : ''}`}
                  loading={i === 0 ? 'lazy' : 'eager'}
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          {idx > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => go(e, -1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {idx < total - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => go(e, 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 text-slate-800 shadow-md flex items-center justify-center hover:bg-white transition md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <div className="absolute inset-x-0 z-10 flex justify-center gap-1 pointer-events-none" style={dotsTop !== null ? { top: dotsTop } : { bottom: dotsBottom }}>
            {Array.from({ length: Math.min(total, 6) }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === Math.min(idx, 5) ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
