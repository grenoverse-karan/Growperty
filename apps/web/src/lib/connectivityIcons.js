import { TramFront, Plane, Route, TrainFront, School, Hospital, ShoppingBag, Store, Trees, Bus, MapPin } from 'lucide-react';

// Icon per CONNECTIVITY_TYPES key (see listingOptions.js).
const CONNECTIVITY_ICONS = {
  metro: TrainFront,
  airport: Plane,
  highway: Route,
  railway: TramFront,
  school: School,
  hospital: Hospital,
  mall: ShoppingBag,
  market: Store,
  park: Trees,
  busStand: Bus,
};

export const getConnectivityIcon = (key) => CONNECTIVITY_ICONS[key] || MapPin;
