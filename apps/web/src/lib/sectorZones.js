/**
 * Zone -> Sector master list for the listing form's dependent dropdowns.
 * Ported & restructured from YeWalaGhar's sectorMasterList.js / greaterNoidaSectors.js.
 *
 * Zone values match the existing Property.city field exactly (so no schema
 * change / migration is needed) — "Ecotech" is the one new value added here.
 */

export const ZONES = [
  { value: 'Greater Noida', label: 'Greater Noida' },
  { value: 'Noida',         label: 'Noida' },
  { value: 'YEIDA',         label: 'Yamuna Expressway' },
];

// City/Zone choices on the property + project listing forms. `comingSoon`
// zones are shown disabled so listers know they're on the way — flip the flag
// (and add their ZONE_SECTORS list) when Growperty starts operating there.
export const LISTING_ZONES = [
  { value: 'Greater Noida',      label: 'Greater Noida' },
  { value: 'YEIDA',              label: 'Yamuna Expressway (YEIDA)' },
  { value: 'Noida',              label: 'Noida', comingSoon: true },
  { value: 'Greater Noida West', label: 'Greater Noida West', comingSoon: true },
];

export const ZONE_SECTORS = {
  'Greater Noida': [
    // Core residential sectors (alphabetical groups)
    'Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2',
    'Gamma 1', 'Gamma 2',
    'Delta 1', 'Delta 2', 'Delta 3',
    'Eta 1', 'Eta 2', 'Theta 1', 'Theta 2',
    'Zeta 1', 'Zeta 2', 'Iota 1', 'Iota 2', 'Kappa 1', 'Kappa 2',
    'Lambda 1', 'Lambda 2', 'Lambda 3', 'Mu 1', 'Mu 2', 'Mu (Main)',
    'Omicron 1A', 'Omicron 1', 'Omicron 2', 'Omicron 3',
    'Phi 1', 'Phi 2', 'Phi 3', 'Phi 4', 'Pi 1', 'Pi 2', 'Pi (Main)',
    'Sigma 1', 'Sigma 2', 'Sigma 3', 'Sigma 4', 'Tau 1', 'Tau 2',
    'Chi 1', 'Chi 2', 'Chi 3', 'Chi 4', 'Chi 5', 'Xu 1', 'Xu 2', 'Xu 3',
    'Omega 1', 'Omega 2', 'Omega 3', 'Omega 4',
    'P3', 'P4', 'Sector 31 (Swarn Nagri)', 'Sector 36 (Rho 1)', 'Sector 37 (Rho 2)',
    'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28', 'Sector 29',
    'Sector 30', 'Sector 32', 'Sector 33', 'Sector 34', 'Sector 35',
    'Sector 38', 'Sector 39',
    // Institutional, commercial & special hubs
    'Knowledge Park 1', 'Knowledge Park 2', 'Knowledge Park 3',
    'Knowledge Park 4', 'Knowledge Park 5', 'Bindal Enclave',
    'Techzone', 'Techzone 2', 'Techzone 3', 'Techzone 4',
    'Jaypee Greens', 'Site 4 (UPSIDC)', 'Site 5 (UPSIDC)',
    // Greater Noida West (Noida Extension)
    'Sector 1 (Greater Noida West)', 'Sector 2 (Greater Noida West)',
    'Sector 3 (Greater Noida West)', 'Sector 4 (Greater Noida West)',
    'Sector 10 (Greater Noida West)', 'Sector 11 (Greater Noida West)',
    'Sector 12 (Greater Noida West)', 'Sector 16 (Greater Noida West)',
    'Sector 16B (Greater Noida West)', 'Sector 16C (Greater Noida West)',
    // Villages
    'Village Luksar', 'Village Tugalpur', 'Village Chuharpur', 'Village Rampur',
    'Village Dabra', 'Village Jaitpur', 'Village Surajpur', 'Village Malakpur',
    'Village Gharbara', 'Village Kasna', 'Village Birondi', 'Village Bironda',
    'Village Khanpur', 'Village Tushyana', 'Village Nawada', 'Village Dadha',
    'Village Acher', 'Village Dankaur',
    'Village Achheja', 'Village Aimnabad', 'Village Amka', 'Village Anandpur',
    'Village Asdullapur', 'Village Astauli', 'Village Badalpur', 'Village Bairangpur',
    'Village Bhanauta', 'Village Bodaki', 'Village Chamrawali', 'Village Chhapraula',
    'Village Chirsi', 'Village Chiti', 'Village Dadri (Rural)', 'Village Dayanagar',
    'Village Devla', 'Village Dhoom Manikpur', 'Village Ghanghola', 'Village Girdharpur',
    'Village Gulistanpur', 'Village Gunpura', 'Village Habibpur', 'Village Imalyaka',
    'Village Jaganpur', 'Village Jalpura', 'Village Jamalpur', 'Village Kanarsi',
    'Village Khairpur Gurjar', 'Village Kherli', 'Village Kidawali', 'Village Kulesara',
    'Village Lakhnawali', 'Village Milk Khandera', 'Village Murshadpur',
    'Village Nagla Ali Khan', 'Village Patwari', 'Village Phoolpur',
    'Village Raghunathpur', 'Village Rampur Jagir', 'Village Rupvas',
    'Village Sadullapur', 'Village Saini', 'Village Shahberi', 'Village Sunpura',
    'Village Suthiyana', 'Village Tilpta Karanwas', 'Village Vaidpura',
  ],
  'Noida': [
    // Sectors 1-168 (numeric order) — Phase I/II/III industrial, core
    // residential, expressway, and commercial/institutional hubs combined.
    'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
    'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 11 (Industrial)',
    'Sector 12', 'Sector 14', 'Sector 15', 'Sector 16A (Film City)', 'Sector 17',
    'Sector 18 (Atta Market)', 'Sector 19', 'Sector 20', 'Sector 21', 'Sector 22', 'Sector 23',
    'Sector 25', 'Sector 25A', 'Sector 26', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 30',
    'Sector 31', 'Sector 32 (Noida City Centre)', 'Sector 33', 'Sector 34', 'Sector 35',
    'Sector 36', 'Sector 37', 'Sector 38A (GIP)', 'Sector 39', 'Sector 40', 'Sector 41',
    'Sector 44', 'Sector 45', 'Sector 46', 'Sector 47', 'Sector 48', 'Sector 50', 'Sector 51',
    'Sector 52', 'Sector 53', 'Sector 55', 'Sector 56', 'Sector 57', 'Sector 58', 'Sector 59',
    'Sector 60', 'Sector 62 (Institutional)', 'Sector 63', 'Sector 64', 'Sector 65', 'Sector 67',
    'Sector 68', 'Sector 70', 'Sector 71', 'Sector 72', 'Sector 73', 'Sector 74', 'Sector 75',
    'Sector 76', 'Sector 77', 'Sector 78', 'Sector 79', 'Sector 80', 'Sector 81', 'Sector 83',
    'Sector 84', 'Sector 85', 'Sector 87', 'Sector 88', 'Sector 89', 'Sector 90', 'Sector 93',
    'Sector 93A', 'Sector 93B', 'Sector 94', 'Sector 96', 'Sector 97', 'Sector 98', 'Sector 99',
    'Sector 100', 'Sector 104', 'Sector 105', 'Sector 107', 'Sector 108', 'Sector 110',
    'Sector 112', 'Sector 113', 'Sector 116', 'Sector 117', 'Sector 118', 'Sector 119',
    'Sector 120', 'Sector 121', 'Sector 122', 'Sector 124', 'Sector 125', 'Sector 126',
    'Sector 127', 'Sector 128', 'Sector 129', 'Sector 131', 'Sector 132', 'Sector 133',
    'Sector 134', 'Sector 135', 'Sector 137', 'Sector 138', 'Sector 139', 'Sector 140',
    'Sector 140A', 'Sector 141', 'Sector 142', 'Sector 143', 'Sector 143B', 'Sector 144',
    'Sector 145', 'Sector 146', 'Sector 147', 'Sector 148', 'Sector 149', 'Sector 150',
    'Sector 151', 'Sector 152', 'Sector 153', 'Sector 154', 'Sector 155', 'Sector 156',
    'Sector 157', 'Sector 158', 'Sector 159', 'Sector 160', 'Sector 161', 'Sector 162',
    'Sector 163', 'Sector 164', 'Sector 165', 'Sector 166', 'Sector 167', 'Sector 168',
    // Major urban villages (village abadi)
    'Village Bhangel', 'Village Salarpur Khadar', 'Village Gejha',
    'Village Shahdara', 'Village Illahabas', 'Village Wazidpur',
    'Village Harola', 'Village Jhundpura', 'Village Naya Bans',
    'Village Chora Sadatpur', 'Village Atta', 'Village Nithari',
    'Village Chhalera', 'Village Barola', 'Village Mamura',
    'Village Kanawani', 'Village Sorkha', 'Village Hazipur',
    'Village Garhi Chaukhandi', 'Village Sultanpur', 'Village Shahpur',
    'Village Raipur', 'Village Kakrala',
  ],
  'YEIDA': [
    // Core residential sectors
    'Sector 15C', 'Sector 16', 'Sector 17', 'Sector 17A (University Hub)', 'Sector 17B',
    'Sector 18', 'Sector 19', 'Sector 20', 'Sector 22A', 'Sector 22B', 'Sector 22C',
    'Sector 22D', 'Sector 22E', 'Sector 24', 'Sector 24A', 'Sector 25', 'Sector 26',
    // Industrial, MSME & dedicated tech clusters
    'Sector 21 (Film City)', 'Sector 28 (Medical Device Park)', 'Sector 29 (Apparel Park)',
    'Sector 32 (Data Center Park)', 'Sector 33 (Toy Park)',
    // Institutional & Special Development Zones
    'Sports City (SDZ)', 'Yamuna Expressway',
    // Key urban & development villages
    'Village Amarpur', 'Village Nanua Ka Razapur', 'Village Gajan',
    'Village Mirzapur', 'Village Parsaul', 'Village Bhatta', 'Village Dungarpur Rilka',
    'Village Achheja', 'Village Niloni', 'Village Dhanauri', 'Village Kherali Bhav',
    'Village Ronija', 'Village Rabupura', 'Jewar (Noida International Airport)',
  ],
};
