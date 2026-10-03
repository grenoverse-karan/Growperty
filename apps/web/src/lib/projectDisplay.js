import { formatPriceInWords } from '@/lib/priceUtils.js';

// Badge colour per project status (ProjectListingForm's PROJECT_STATUSES,
// plus the legacy "Partially Ready").
const STATUS_COLORS = {
  'Upcoming': 'bg-violet-500 hover:bg-violet-600',
  'New Launch': 'bg-blue-500 hover:bg-blue-600',
  'Under Construction': 'bg-amber-500 hover:bg-amber-600',
  'Nearing Possession': 'bg-orange-500 hover:bg-orange-600',
  'Partially Ready': 'bg-orange-500 hover:bg-orange-600',
  'Ready to Move': 'bg-emerald-500 hover:bg-emerald-600',
  'Completed': 'bg-teal-600 hover:bg-teal-700',
};
export const getStatusColor = (status) => `${STATUS_COLORS[status] || 'bg-slate-500 hover:bg-slate-600'} text-white`;

// Live areas only — Noida / Delhi-NCR are future expansion.
export const PROJECT_CITY_LABELS = { 'Greater Noida': 'Greater Noida', YEIDA: 'Yamuna Expressway' };

export const shortPrice = (n) => `₹${formatPriceInWords(n)}`;

// True once a RERA number AND the certificate itself are both on file —
// just typing a number isn't enough to claim "RERA Approved".
export const isReraApproved = (project) =>
  Boolean(project?.reraNumber?.trim()) && Boolean(project?.documents?.reraCertificate);

// "2, 3 BHK Flat/Apartment" style summary of what the project offers.
export const projectTypeLabel = (p) => {
  const types = (p.propertyTypes || []).join(', ');
  const configs = (p.configurationAvailable || []).map(c => c.replace(' BHK', '')).join(', ');
  return [configs && `${configs} BHK`, types].filter(Boolean).join(' · ') || p.projectType || '—';
};
