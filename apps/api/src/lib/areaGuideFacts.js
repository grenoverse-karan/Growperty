/**
 * Compact per-zone facts mirroring the website's Area Guide pages
 * (GreaterNoidaAreaGuide.jsx / NoidaAreaGuide.jsx / YEIDAAreaGuide.jsx).
 * Used to ground AI-generated listing descriptions in real, site-published
 * area context instead of the AI inventing generic claims.
 */
export const AREA_GUIDE_FACTS = {
  'Greater Noida': {
    summary: "India's first ISO 9001:2000 certified planned city, ~25km from Delhi, with wide roads, underground cabling, and ~25% green cover.",
    priceRange: '₹4,500 - ₹8,500 per sq.ft',
    connectivity: 'Aqua Line metro connects to Noida and Delhi; close to Yamuna Expressway and Noida-Greater Noida Expressway.',
    education: 'Knowledge Park hosts top universities (Sharda, Galgotias, Amity, Bennett, GBU) and schools.',
    industrial: 'Major manufacturing and MNC hub with dedicated industrial sectors.',
    highlights: ['Well-planned sector layout', 'Metro connectivity', 'Education hub', 'Industrial growth'],
  },
  'Noida': {
    summary: 'Established satellite city of Delhi NCR with mature infrastructure, mixed residential/commercial sectors, and dense metro coverage (Blue Line + Aqua Line).',
    priceRange: '₹6,000 - ₹15,000 per sq.ft',
    connectivity: 'DMRC Blue Line (core/commercial) and NMRC Aqua Line (residential/expressway corridor) cover most sectors; DND Flyway and Noida-Greater Noida Expressway link to Delhi.',
    education: 'Numerous reputed schools and colleges across sectors; Amity University zone near Sector 125.',
    industrial: 'Phase I/II/III industrial areas, IT/ITES hubs, and the Noida Special Economic Zone (NSEZ).',
    highlights: ['Mature city infrastructure', 'Dense metro grid', 'Established commercial hubs (Sector 18, City Centre)', 'Strong rental demand'],
  },
  'YEIDA': {
    summary: 'Yamuna Expressway Industrial Development Authority corridor — a 165km planned belt anchored by the upcoming Noida International Airport (Jewar), Film City, and large industrial/institutional zones.',
    priceRange: '₹2,500 - ₹5,500 per sq.ft (plotted schemes)',
    connectivity: 'Direct access via Yamuna Expressway; Noida International Airport (Jewar) under development.',
    education: 'University hub near Sector 17A (Galgotias University, Noida International University).',
    industrial: 'Dedicated Medical Device Park (Sector 28), Apparel Park (Sector 29), Toy Park (Sector 33), Data Center Park (Sector 32), International Film City (Sector 21).',
    highlights: ['Upcoming international airport', 'Large plotted residential schemes', 'Dedicated industrial parks', 'High long-term appreciation potential'],
  },
  'Ecotech': {
    summary: 'Industrial/commercial belt within Greater Noida, geared toward manufacturing, warehousing, and corporate setups rather than dense residential housing.',
    priceRange: '₹3,000 - ₹6,000 per sq.ft',
    connectivity: 'Close to Greater Noida\'s core sectors and the Aqua Line metro corridor.',
    education: 'Shares access to Knowledge Park institutions nearby.',
    industrial: 'Dedicated manufacturing, warehousing, and corporate units across Ecotech 1-12.',
    highlights: ['Industrial/commercial focus', 'Proximity to Greater Noida core', 'Warehousing and corporate units'],
  },
};

export function getAreaGuideFacts(city) {
  return AREA_GUIDE_FACTS[city] || null;
}
