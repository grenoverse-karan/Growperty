import React from 'react';
import { Store, Briefcase, TrendingUp, MapPin } from 'lucide-react';
import LocalityLandingPage from '@/components/LocalityLandingPage.jsx';

const CommercialPropertyGreaterNoidaPage = () => (
  <LocalityLandingPage
    metaTitle="Commercial Property for Sale in Greater Noida | Growperty"
    metaDescription="Shops, showrooms & office spaces for sale in Greater Noida. Check rental yields, price ranges & verified listings on Growperty.com. Request a site visit."
    canonicalPath="/commercial-property-greater-noida"
    badge="Greater Noida"
    title="Commercial Property for Sale in Greater Noida"
    heroSubtitle="Shops, showrooms and office spaces in Greater Noida's established commercial markets and upcoming retail hubs."
    stats={[
      { value: '₹15K–₹30K', label: 'Price / Sq.ft' },
      { value: '3.5–5%', label: 'Avg. Rental Yield' },
      { value: 'High', label: 'Footfall Growth' },
    ]}
    intro={[
      "Greater Noida's rapid residential growth has fueled equally strong demand for commercial real estate — shops, showrooms, office spaces and society-facing retail units that serve the city's expanding population. For investors, commercial property here offers a meaningful advantage over residential: rental yields of roughly 3.5-5% annually, nearly double what most residential flats generate, alongside the potential for steady capital appreciation as more sectors reach full occupancy.",
      "Commercial hubs are concentrated around established markets in Alpha, Beta and Gamma sectors, large-format destinations like Grand Venice Mall and Omaxe Connaught Place, and society-facing retail shops within newer group housing developments — a format increasingly popular with small investors because of lower ticket sizes and ready catchment from resident footfall. Prices for shops and retail spaces generally range from ₹15,000 to ₹30,000 per square foot depending on location, footfall, and whether the unit is pre-leased.",
      "Office space demand is also rising steadily, driven by Greater Noida's growing base of IT/ITES companies, manufacturing units, and proximity to Knowledge Park's educational and corporate institutions — making it an increasingly attractive, lower-cost alternative to office markets in Noida and Gurugram, with typical rates well below those two cities for comparable grade-A space.",
      "As with any commercial purchase, buyers should verify the property's approved land-use/commercial conversion status, occupancy certificate, and any existing lease agreements before purchasing a pre-leased unit. Growperty lists each commercial property with the details shared by the seller; we recommend independent legal verification for any transaction, as noted in our full disclaimer.",
      'Explore live commercial listings below, or request a visit to inspect a shortlisted shop, showroom or office in person.',
    ]}
    priceRows={[
      { type: 'Society-facing Shop', range: '₹15,000 – ₹22,000 / sq.ft' },
      { type: 'Market Shop / Showroom', range: '₹20,000 – ₹30,000 / sq.ft' },
      { type: 'Office Space', range: '₹5,000 – ₹9,000 / sq.ft' },
    ]}
    connectivity={[
      { icon: Store, title: 'Established Markets', desc: 'Active commercial belts in Alpha, Beta and Gamma sectors with steady footfall.' },
      { icon: Briefcase, title: 'Corporate & IT Hub', desc: 'Growing presence of IT/ITES firms and manufacturing units near Knowledge Park.' },
      { icon: TrendingUp, title: 'Rising Rental Demand', desc: 'Population growth across Greater Noida continues to push retail and office demand higher.' },
      { icon: MapPin, title: 'Central Access', desc: 'Well connected to Delhi, Noida and the Yamuna Expressway corridor.' },
    ]}
    faqs={[
      { q: 'What rental yield can I expect from commercial property in Greater Noida?', a: 'Commercial units in Greater Noida typically generate rental yields of around 3.5% to 5% annually, higher than most residential properties in the same sectors.' },
      { q: "What's the price range for a shop in Greater Noida?", a: 'Society-facing shops typically start around ₹15,000 per sq.ft, while shops in established markets or malls can range up to ₹30,000 per sq.ft depending on footfall and location.' },
      { q: 'Should I buy a pre-leased commercial property?', a: 'Pre-leased units offer immediate rental income but typically come at a premium — always verify the lease agreement terms, tenant profile, and remaining lease tenure before buying.' },
      { q: "How do I verify a commercial property's land-use approval?", a: 'Check the property’s land-use/commercial conversion certificate and occupancy certificate with GNIDA, and we recommend involving a property lawyer for full due diligence.' },
    ]}
    mapQuery="Alpha Commercial Belt, Greater Noida, Uttar Pradesh"
    listingsHeading="Commercial Property for Sale in Greater Noida"
    listingsFilter={{ propertyType: 'Commercial', city: 'Greater Noida' }}
    fallbackFilter={{ city: 'Greater Noida' }}
    requirementContext={{ propertyType: 'Commercial', city: 'Greater Noida' }}
  />
);

export default CommercialPropertyGreaterNoidaPage;
