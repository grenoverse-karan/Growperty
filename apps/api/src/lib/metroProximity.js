/**
 * Metro station proximity data — strict max-2km aerial radius — for Greater
 * Noida and Noida. Used to ground AI-generated listing descriptions with
 * accurate "near X metro station" claims instead of the AI guessing.
 *
 * Each station lists the sectors/villages within ~2km aerial distance, with
 * the approximate distance noted. Sector/village names are matched against
 * Property.sector via normalizeName() (case/whitespace tolerant).
 */
const GREATER_NOIDA_METRO = [
  {
    line: 'Aqua Line', name: 'Knowledge Park II',
    sectors: ['Knowledge Park 2', 'Knowledge Park 1', 'Knowledge Park 3', 'Omega 1', 'Ansal Golf Links-1'],
    villages: ['Village Tugalpur'],
  },
  {
    line: 'Aqua Line', name: 'Pari Chowk',
    sectors: ['Alpha 1', 'Beta 1', 'Alpha 2', 'Beta 2', 'Gamma 1', 'Omega 1', 'Jaypee Greens'],
    villages: ['Village Tugalpur', 'Village Bironda'],
  },
  {
    line: 'Aqua Line', name: 'Alpha 1',
    sectors: ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1', 'Gamma 2', 'Delta 1'],
    villages: ['Village Bironda', 'Village Rampur Jagir'],
  },
  {
    line: 'Aqua Line', name: 'Delta 1',
    sectors: ['Delta 1', 'Delta 2', 'Delta 3', 'Delta 4', 'Beta 2', 'Gamma 2'],
    villages: ['Village Rampur Jagir', 'Village Dadha'],
  },
  {
    line: 'Aqua Line', name: 'GNIDA Office',
    sectors: ['Gamma 2', 'Delta 2', 'Delta 3', 'Omicron 1', 'Omicron 2', 'Mu 1'],
    villages: ['Village Dadha', 'Village Birondi Chakravedpur'],
  },
  {
    line: 'Aqua Line', name: 'Depot Station',
    sectors: ['Sigma 1', 'Sigma 2', 'Sigma 3', 'Sigma 4', 'Phi 1', 'Phi 2', 'Phi 3', 'Phi 4', 'Xu 1', 'Ecotech 1'],
    villages: ['Village Chamrawali', 'Village Gulistanpur'],
  },
];

const NOIDA_METRO = [
  // DMRC Blue Line
  { line: 'Blue Line', name: 'Noida Sector 15', sectors: ['Sector 1', 'Sector 2', 'Sector 14', 'Sector 15', 'Sector 15A', 'Sector 16'], villages: ['Village Naya Bans'] },
  { line: 'Blue Line', name: 'Noida Sector 16', sectors: ['Sector 2', 'Sector 3', 'Sector 15', 'Sector 16', 'Sector 16A (Film City)', 'Sector 17'], villages: ['Village Harola'] },
  { line: 'Blue Line', name: 'Noida Sector 18', sectors: ['Sector 18 (Atta Market)', 'Sector 19', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 38A (GIP)'], villages: ['Village Atta'] },
  { line: 'Blue Line', name: 'Botanical Garden', sectors: ['Sector 28', 'Sector 29', 'Sector 37', 'Sector 38', 'Sector 44'], villages: ['Village Chhalera'] },
  { line: 'Blue Line', name: 'Golf Course', sectors: ['Sector 36', 'Sector 37', 'Sector 43', 'Sector 44'], villages: ['Village Chhalera', 'Village Sadarpur'] },
  { line: 'Blue Line', name: 'Noida City Centre', sectors: ['Sector 32 (Noida City Centre)', 'Sector 34', 'Sector 35', 'Sector 39', 'Sector 40', 'Sector 41'], villages: ['Village Morna'] },
  { line: 'Blue Line', name: 'Noida Sector 34', sectors: ['Sector 33', 'Sector 34', 'Sector 35', 'Sector 51', 'Sector 52', 'Sector 53'], villages: ['Village Morna'] },
  { line: 'Blue Line', name: 'Noida Sector 52', sectors: ['Sector 51', 'Sector 52', 'Sector 61', 'Sector 71', 'Sector 53'], villages: ['Village Hoshiyarpur'] },
  { line: 'Blue Line', name: 'Noida Sector 61', sectors: ['Sector 53', 'Sector 60', 'Sector 61', 'Sector 71', 'Sector 72'], villages: ['Village Hoshiyarpur', 'Village Kanawani'] },
  { line: 'Blue Line', name: 'Noida Sector 59', sectors: ['Sector 57', 'Sector 58', 'Sector 59', 'Sector 60', 'Sector 66'], villages: ['Village Mamura'] },
  { line: 'Blue Line', name: 'Noida Sector 62', sectors: ['Sector 62 (Institutional)', 'Sector 63', 'Sector 64'], villages: ['Village Mamura'] },
  { line: 'Blue Line', name: 'Noida Electronic City', sectors: ['Sector 62 (Institutional)', 'Sector 63', 'Sector 64', 'Sector 65'], villages: ['Village Navada', 'Village Khora Border'] },
  // NMRC Aqua Line
  { line: 'Aqua Line', name: 'Sector 51', sectors: ['Sector 51', 'Sector 52', 'Sector 71', 'Sector 72'], villages: ['Village Hoshiyarpur'] },
  { line: 'Aqua Line', name: 'Sector 50', sectors: ['Sector 50', 'Sector 49', 'Sector 75', 'Sector 76'], villages: ['Village Barola'] },
  { line: 'Aqua Line', name: 'Sector 76', sectors: ['Sector 74', 'Sector 75', 'Sector 76', 'Sector 77', 'Sector 49'], villages: ['Village Barola', 'Village Sorkha'] },
  { line: 'Aqua Line', name: 'Sector 101', sectors: ['Sector 78', 'Sector 79', 'Sector 101', 'Sector 107', 'Sector 49'], villages: ['Village Salarpur Khadar', 'Village Barola'] },
  { line: 'Aqua Line', name: 'Sector 81', sectors: ['Sector 81', 'Sector 82', 'Sector 80'], villages: ['Village Bhangel', 'Village Gejha'] },
  { line: 'Aqua Line', name: 'NSEZ', sectors: ['Sector 81', 'Sector 82', 'Sector 83', 'Sector 85', 'Sector 102'], villages: ['Village Bhangel'] },
  { line: 'Aqua Line', name: 'Sector 83', sectors: ['Sector 83', 'Sector 84', 'Sector 88'], villages: ['Village Kakrala'] },
  { line: 'Aqua Line', name: 'Sector 137', sectors: ['Sector 137', 'Sector 142', 'Sector 136', 'Sector 93', 'Sector 93B'], villages: ['Village Shahpur', 'Village Gejha'] },
  { line: 'Aqua Line', name: 'Sector 142', sectors: ['Sector 142', 'Sector 141', 'Sector 136', 'Sector 168'], villages: ['Village Shahpur', 'Village Manglyat'] },
  { line: 'Aqua Line', name: 'Sector 143', sectors: ['Sector 143', 'Sector 143B', 'Sector 142', 'Sector 141'], villages: ['Village Shahpur'] },
  { line: 'Aqua Line', name: 'Sector 144', sectors: ['Sector 144', 'Sector 143', 'Sector 168'], villages: ['Village Wazidpur'] },
  { line: 'Aqua Line', name: 'Sector 145', sectors: ['Sector 145', 'Sector 144', 'Sector 146'], villages: ['Village Wazidpur'] },
  { line: 'Aqua Line', name: 'Sector 146', sectors: ['Sector 146', 'Sector 145', 'Sector 147'], villages: ['Village Kambuksi'] },
  { line: 'Aqua Line', name: 'Sector 147', sectors: ['Sector 147', 'Sector 146', 'Sector 148'], villages: ['Village Kondli'] },
  { line: 'Aqua Line', name: 'Sector 148', sectors: ['Sector 148', 'Sector 147'], villages: ['Village Garhi Samastipur'] },
  // DMRC Magenta Line (border stretch)
  { line: 'Magenta Line', name: 'Okhla Bird Sanctuary', sectors: ['Sector 94', 'Sector 95', 'Sector 124', 'Sector 125'], villages: ['Village Asgarpur Jagir'] },
];

function normalizeName(s) {
  return String(s || '').toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns the metro station(s) whose sector/village list includes the given
 * sector — i.e. the property sits within ~2km aerial distance of that station.
 * Returns [] if the zone has no metro data or no match is found.
 */
export function findNearbyMetro(city, sector) {
  const stations = city === 'Greater Noida' ? GREATER_NOIDA_METRO : city === 'Noida' ? NOIDA_METRO : [];
  if (!stations.length || !sector) return [];
  const target = normalizeName(sector);
  const matches = [];
  for (const station of stations) {
    const inSectors = station.sectors.some(s => normalizeName(s) === target);
    const inVillages = station.villages.some(v => normalizeName(v) === target || normalizeName(v).includes(target));
    if (inSectors || inVillages) matches.push({ line: station.line, name: station.name });
  }
  return matches;
}
