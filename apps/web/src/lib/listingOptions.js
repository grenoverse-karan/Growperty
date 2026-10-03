// Chip options shared by the property and project listing forms.

export const BEST_FOR_RESIDENTIAL = ['Investment', 'Rental', 'Resale Value', 'Capital Appreciation', 'First Home', 'Luxury Living', 'Retirement', 'Vacation Home', 'Weekend Getaway', 'Joint Family', 'Students & Working Professionals', 'Co-Living / PG', 'Gated Community', 'Farmhouse Living', 'High Rental Yield', 'NRI Investment'];
export const BEST_FOR_PLOT = ['Investment', 'Plot Development', 'Farmhouse Living', 'Commercial Use', 'Capital Appreciation', 'Rental', 'Resale Value', 'Gated Community', 'NRI Investment', 'High Rental Yield'];
export const BEST_FOR_COMMERCIAL = ['Investment', 'Commercial Use', 'Office Use', 'High Rental Yield', 'Retail Business', 'Restaurant / Café', 'Warehouse / Godown', 'Healthcare Use', 'Education Use', 'Hospitality Use'];

export const OFFER_TITLE_PRESETS = ['Diwali Offer', 'Navratri Offer', 'Dhanteras Offer', 'Happy New Year Offer', 'Holi Offer', 'Independence Day Offer', 'Festival Offer', 'Limited Time Offer'];
export const OFFER_DETAIL_PRESETS = ['1% Off', '2% Off', '5% Off', 'No Brokerage', 'Free Car Parking', 'Free Modular Kitchen', 'Stamp Duty Waiver', 'Gold Coin on Booking', '43" LED Smart TV', '7kg Automatic Washing Machine', '1.5 Ton Split AC', 'Double Door Fridge', '₹20,000 Shopping Vouchers', '3 Night Travel Package'];

// Structured "Connectivity & Nearby Facilities" rows on the listing forms — one per category, each
// with a place name and a distance/time the builder types in.
export const CONNECTIVITY_TYPES = [
  { key: 'market', label: 'Market', placeholder: 'e.g. Kasna Market' },
  { key: 'park', label: 'Public Park', placeholder: 'e.g. City Park' },
  { key: 'metro', label: 'Metro', placeholder: 'e.g. Pari Chowk Metro Station' },
  { key: 'school', label: 'School', placeholder: 'e.g. Delhi Public School' },
  { key: 'hospital', label: 'Hospital', placeholder: 'e.g. Yatharth Hospital' },
  { key: 'mall', label: 'Mall', placeholder: 'e.g. Grand Venice Mall' },
  { key: 'busStand', label: 'Bus Stand', placeholder: 'e.g. Pari Chowk Bus Stand' },
  { key: 'airport', label: 'Airport', placeholder: 'e.g. Noida International Airport' },
  { key: 'highway', label: 'Highway', placeholder: 'e.g. Yamuna Expressway' },
  { key: 'railway', label: 'Railway Station', placeholder: 'e.g. Dadri Railway Station' },
];

// Project "Documents" section — one optional file (PDF or image) each.
// `statuses` limits a document to projects in those statuses; `canApply`
// lets the builder mark it "Applied" when the certificate isn't issued yet.
export const PROJECT_DOCUMENT_TYPES = [
  { key: 'reraCertificate', label: 'RERA Certificate', canApply: true },
  { key: 'gstCertificate', label: 'GST Certificate', canApply: true },
  { key: 'isoCertificate', label: 'ISO Certificate', canApply: true },
  { key: 'approvalDocs', label: 'Project Approval / Sanction Documents', canApply: true },
  { key: 'sitePlan', label: 'Site Plan' },
  { key: 'masterPlan', label: 'Master Plan' },
  { key: 'paymentPlan', label: 'Payment Plan' },
  { key: 'priceList', label: 'Price List' },
  { key: 'possessionLetter', label: 'Possession Letter', statuses: ['Ready to Move', 'Completed'] },
];

// Form state keeps connectivity as { [key]: { name, distance } }; the API
// stores [{ type, name, distance }] with only the rows that have a name.
export const connectivityToRows = (byKey = {}) =>
  CONNECTIVITY_TYPES
    .map(({ key }) => ({ type: key, name: byKey[key]?.name?.trim() || '', distance: byKey[key]?.distance?.trim() || '' }))
    .filter(row => row.name);

export const connectivityFromRows = (rows) =>
  Object.fromEntries((Array.isArray(rows) ? rows : [])
    .filter(r => r?.type)
    .map(r => [r.type, { name: r.name || '', distance: r.distance || '' }]));
