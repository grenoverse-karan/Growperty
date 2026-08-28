import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

/**
 * Public sector-level map link.
 *
 * SECURITY: Only ever passed the property's sector + city (already public,
 * sector-level info) — never the exact address, house number, or society.
 *
 * Links out to Google Maps using the sector name as a text search query, so
 * Google's own geocoder resolves the location — far more accurate than a
 * hand-maintained lat/lng table, which kept landing on the wrong spot.
 */
export default function SectorMap({ sector, city }) {
  if (!sector && !city) return null;

  const query = [sector, city, 'India'].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
    >
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        Show in Map
      </span>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
    </a>
  );
}
