import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Full-screen photo viewer. Controlled: the parent owns which photo is shown
 * (`index` / `onIndexChange`) so closing it leaves the page gallery on the
 * same photo. Keyboard: ← → to move, Esc to close. Swipe on touch screens.
 */
const ImageLightbox = ({ images, index, onIndexChange, open, onClose, alt = '', placeholder }) => {
  const touchStartX = useRef(null);
  const count = images?.length || 0;

  const prev = () => onIndexChange((index - 1 + count) % count);
  const next = () => onIndexChange((index + 1) % count);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && count > 1) prev();
      else if (e.key === 'ArrowRight' && count > 1) next();
    };
    window.addEventListener('keydown', onKey);
    // Stop the page behind from scrolling while the viewer is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, count]);

  if (!open || !count) return null;

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{index + 1} / {count}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Photo */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={index}
          src={images[index]}
          alt={`${alt} - image ${index + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          onError={placeholder ? (e) => { e.target.src = placeholder; } : undefined}
          draggable={false}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="shrink-0 flex gap-2 overflow-x-auto px-4 py-3 justify-start sm:justify-center" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Photo ${i + 1}`}
              className={`shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ImageLightbox;
