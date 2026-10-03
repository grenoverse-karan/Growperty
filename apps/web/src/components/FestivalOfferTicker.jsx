import React from 'react';
import { Link } from 'react-router-dom';

const MESSAGE = ['🪔', 'Get exciting festival OFFERS', '🎉', 'Save more on verified properties', '🎁', 'Limited time only', '🪔', 'Get exciting festival OFFERS', '🎊', 'Free gifts & discounts on select listings', '✨'];

// Thin orange strip under the header with a continuously moving offer
// message. Clicking it opens the property listings — pass `to={null}` on the
// listings page itself, where a link back to the same page would be pointless.
const FestivalOfferTicker = ({ to = '/properties' }) => {
  // Rendered twice back to back so the CSS loop (index.css → .ticker-track) is seamless.
  const run = (hidden) => (
    <span aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6">
      {MESSAGE.map((part, i) => (
        <span key={i} className={part.length <= 2 ? 'text-base leading-none' : 'text-xs sm:text-sm font-extrabold tracking-wide uppercase whitespace-nowrap'}>
          {part}
        </span>
      ))}
    </span>
  );

  const className = 'shine-badge relative block overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-2';
  const track = (
    <div className="ticker-track flex w-max">
      {run(false)}
      {run(true)}
    </div>
  );

  return to ? (
    <Link to={to} aria-label="Get exciting festival offers — view properties" className={className}>{track}</Link>
  ) : (
    <div role="marquee" aria-label="Get exciting festival offers" className={className}>{track}</div>
  );
};

export default FestivalOfferTicker;
