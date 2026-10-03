import React from 'react';
import { Route as Road, Train, MapPin, ShieldCheck } from 'lucide-react';
import LocalityLandingPage from '@/components/LocalityLandingPage.jsx';

const FreeholdPlotsGreaterNoidaPage = () => (
  <LocalityLandingPage
    metaTitle="Freehold Plots for Sale in Greater Noida | Growperty.com"
    metaDescription="Explore freehold residential plots for sale in Greater Noida's GNIDA-planned sectors. Verify tenure, check prices & request a site visit on Growperty.com."
    canonicalPath="/freehold-plots-greater-noida"
    badge="Greater Noida"
    title="Freehold Plots for Sale in Greater Noida"
    heroSubtitle="Residential plots in GNIDA-developed sectors, ideal for custom home construction or long-term land investment."
    stats={[
      { value: '₹60K–₹1.2L', label: 'Price / Sq.yd' },
      { value: 'GNIDA', label: 'Authority-Planned Sectors' },
      { value: '10–15%', label: 'Avg. Annual Appreciation' },
    ]}
    intro={[
      'A freehold plot gives the owner full, unrestricted ownership of the land — unlike leasehold land, where the authority retains ultimate title and imposes conditions on transfer or construction. In Greater Noida, residential plots allotted by the Greater Noida Industrial Development Authority (GNIDA) are typically freehold once the lease-to-freehold conversion process and full payment are complete, making them one of the most sought-after investment options in the region.',
      "Plots remain popular with buyers who want the flexibility to design and build their own home, as well as with investors looking for long-term capital appreciation in a market that has consistently outperformed built-up property in percentage terms. Greater Noida's plot prices currently range from roughly ₹60,000 to ₹1,20,000 per square yard, depending on the sector, road width, corner/park-facing status, and proximity to expressways or metro connectivity.",
      "Popular residential plot sectors include Phi, Chi, Omega and the newer sectors nearer the Yamuna Expressway, many of which sit within well-planned layouts featuring underground cabling, wide internal roads, and dedicated green belts — a hallmark of GNIDA's master planning.",
      "Important note for buyers: ownership/tenure status (freehold vs. leasehold, registry completion, conversion charges paid) can vary plot to plot, and should always be independently verified through the seller's original allotment letter, registry documents, and a direct check with GNIDA before making any payment. Growperty displays each plot's details as shared by the seller but does not independently certify land tenure — please read our full disclaimer and conduct your own legal due diligence, ideally with a property lawyer, before finalising any purchase.",
      'Browse verified plot listings below, or request a site visit to inspect a shortlisted plot in person with our local team.',
    ]}
    priceRows={[
      { type: 'Up to 100 sq.yd', range: '₹60,000 – ₹80,000 / sq.yd' },
      { type: '100–200 sq.yd', range: '₹70,000 – ₹1,00,000 / sq.yd' },
      { type: '200+ sq.yd (Corner/Park-facing)', range: '₹90,000 – ₹1,20,000 / sq.yd' },
    ]}
    connectivity={[
      { icon: Road, title: 'Planned Road Network', desc: 'Wide internal roads and direct access to the Noida-Greater Noida and Yamuna Expressways.' },
      { icon: Train, title: 'Metro-Linked Sectors', desc: 'Several plot sectors sit within reach of the Aqua Line metro corridor.' },
      { icon: ShieldCheck, title: 'Authority-Planned Infrastructure', desc: 'Underground cabling, sewage and green belts across GNIDA-developed layouts.' },
      { icon: MapPin, title: 'Central Location', desc: 'Well connected to Delhi, Noida, Ghaziabad and the upcoming airport corridor.' },
    ]}
    faqs={[
      { q: 'What does "freehold" mean for a plot in Greater Noida?', a: 'A freehold plot means the buyer gets full, permanent ownership of the land with no restrictions from the development authority, unlike leasehold land where the authority retains ultimate title. Most GNIDA-allotted residential plots convert to freehold once dues and conversion charges are cleared.' },
      { q: 'How do I verify if a plot is actually freehold?', a: "Always check the seller's original allotment letter, freehold conversion certificate, and registry documents, and independently confirm the status with GNIDA before paying any token amount. We strongly recommend involving a property lawyer." },
      { q: 'What is the typical price range for plots in Greater Noida?', a: 'Prices generally range from ₹60,000 to ₹1,20,000 per square yard depending on sector, plot size, road width and corner/park-facing status.' },
      { q: 'Can Growperty help with construction after I buy a plot?', a: 'Growperty focuses on property discovery and transactions; for construction, our team can connect you with local architects and contractors on request.' },
    ]}
    mapQuery="Phi Sector, Greater Noida, Uttar Pradesh"
    listingsHeading="Plots for Sale in Greater Noida"
    listingsFilter={{ propertyType: 'Plot/Land', city: 'Greater Noida' }}
    requirementContext={{ propertyType: 'Plot/Land', city: 'Greater Noida' }}
  />
);

export default FreeholdPlotsGreaterNoidaPage;
