import React from 'react';
import { Route as Road, Train, Plane, MapPin } from 'lucide-react';
import LocalityLandingPage from '@/components/LocalityLandingPage.jsx';

const FlatsInGreaterNoidaPage = () => (
  <LocalityLandingPage
    metaTitle="Flats for Sale in Greater Noida | Growperty.com"
    metaDescription="Verified 1, 2 & 3 BHK flats for sale in Greater Noida — transparent pricing, direct seller contact & free site visits. Browse live listings."
    canonicalPath="/flats-in-greater-noida"
    badge="Greater Noida"
    title="Flats for Sale in Greater Noida"
    heroSubtitle="Verified 1, 2 and 3 BHK apartments across Greater Noida's established and emerging sectors — from ready-to-move homes to new launches."
    stats={[
      { value: '22+', label: 'Live Flat Listings' },
      { value: '₹25L–₹1.5Cr', label: 'Price Range' },
      { value: '200+', label: 'Sectors Covered' },
    ]}
    intro={[
      "Greater Noida has grown into one of the National Capital Region's most planned residential markets, and flats remain the most in-demand property type here — offering buyers a mix of affordability, modern amenities, and strong rental potential. On Growperty, you'll find verified flat listings across well-established sectors like Phi, Chi, Alpha, Beta and Omega, as well as newer pockets closer to the Yamuna Expressway corridor.",
      "Most flats for sale in Greater Noida fall into three broad categories: affordable 1 and 2 BHK units in group housing societies (ideal for first-time buyers and young families), spacious 3 BHK apartments in gated communities with clubhouse and security amenities, and premium 3-4 BHK or penthouse units in select high-rise projects. Prices typically range from ₹25 lakh for a compact 1 BHK to over ₹1.5 crore for larger, well-located apartments, though exact pricing depends heavily on sector, builder reputation, floor, and possession status.",
      "Connectivity is one of the biggest reasons buyers choose Greater Noida over costlier NCR markets. The Noida-Greater Noida Expressway and Yamuna Expressway give quick access to Noida, Delhi and the upcoming Noida International Airport, while the Aqua Line metro connects several sectors directly to Noida's metro network. Combined with wide roads, dedicated green belts, and a steadily growing social infrastructure of schools, hospitals and malls, it's easy to see why flat demand here has stayed resilient even as prices in neighbouring cities have climbed.",
      'Every flat listed on Growperty is verified by our team before it goes live, and each listing shows clear pricing and direct contact with the seller or their representative — no middlemen markups. Browse live listings below, or use the "Request a Visit" option to have our local team arrange site visits for shortlisted flats at a time that works for you.',
    ]}
    priceRows={[
      { type: '1 BHK Flat', range: '₹25 Lac – ₹40 Lac' },
      { type: '2 BHK Flat', range: '₹45 Lac – ₹75 Lac' },
      { type: '3 BHK Flat', range: '₹75 Lac – ₹1.5 Cr' },
      { type: '4 BHK / Penthouse', range: '₹1.5 Cr – ₹3.5 Cr' },
    ]}
    connectivity={[
      { icon: Road, title: 'Expressway Access', desc: 'Direct access to the Noida-Greater Noida Expressway and Yamuna Expressway for quick commutes to Delhi and Noida.' },
      { icon: Train, title: 'Metro Connectivity', desc: 'The Aqua Line metro links several Greater Noida sectors to Noida’s broader metro network.' },
      { icon: Plane, title: 'Airport Proximity', desc: 'Around 40 minutes from the upcoming Noida International Airport via the Yamuna Expressway.' },
      { icon: MapPin, title: 'Nearby Cities', desc: 'Well connected to Delhi, Noida, Ghaziabad and Faridabad.' },
    ]}
    faqs={[
      { q: 'What is the price range for flats in Greater Noida?', a: 'Flats in Greater Noida typically range from ₹25 lakh for a 1 BHK in an affordable sector to over ₹1.5 crore for a large 3-4 BHK in a premium gated society. Exact pricing depends on sector, builder, floor and possession status.' },
      { q: 'Which sectors are best for buying a flat in Greater Noida?', a: 'Sectors like Alpha, Beta, Gamma, Omega and Chi are well-established with good infrastructure, while Phi and newer sectors closer to the Yamuna Expressway offer relatively more affordable entry points with strong appreciation potential.' },
      { q: 'Are the flat listings on Growperty verified?', a: 'Yes. Every listing on Growperty is reviewed by our team before it’s published, and we display transparent pricing with direct seller contact — no hidden broker markups.' },
      { q: 'Can I schedule a site visit before buying?', a: 'Absolutely — use the "Request a Visit" button on this page, and our local team will coordinate a visit at your preferred date and time.' },
    ]}
    mapQuery="Greater Noida, Uttar Pradesh"
    listingsHeading="Flats for Sale in Greater Noida"
    listingsFilter={{ propertyType: 'Flat/Apartment', city: 'Greater Noida' }}
    requirementContext={{ propertyType: 'Flat/Apartment', city: 'Greater Noida' }}
  />
);

export default FlatsInGreaterNoidaPage;
