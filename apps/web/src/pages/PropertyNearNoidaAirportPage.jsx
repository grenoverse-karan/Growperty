import React from 'react';
import { Plane, Route as Road, Train, MapPin } from 'lucide-react';
import LocalityLandingPage from '@/components/LocalityLandingPage.jsx';

const PropertyNearNoidaAirportPage = () => (
  <LocalityLandingPage
    metaTitle="Property Near Noida International Airport | Growperty.com"
    metaDescription="Flats, plots & commercial property in Greater Noida, within easy reach of the Noida International Airport via the Yamuna Expressway. Verified listings."
    canonicalPath="/property-near-noida-international-airport"
    badge="Airport Corridor"
    title="Property Near Noida International Airport"
    heroSubtitle="Flats, plots and commercial options in Greater Noida, within easy reach of the under-construction Noida International Airport via the Yamuna Expressway."
    stats={[
      { value: '~40 min', label: 'Drive to Airport Site' },
      { value: 'Phased', label: 'Under Construction' },
      { value: '30+', label: 'Live Listings Nearby' },
    ]}
    intro={[
      "The Noida International Airport, under construction at Jewar on the Yamuna Expressway, is one of the single biggest infrastructure catalysts for real estate across the entire Greater Noida–YEIDA belt. Once operational, it's expected to significantly cut travel times for both passengers and cargo, draw logistics, hospitality and commercial investment to the surrounding sectors, and push up land and property values across the corridor that connects it back to Greater Noida and Noida.",
      '"Property near the airport" today largely means two things: land directly within YEIDA’s airport-influence sectors — still in earlier stages of development, authority-driven allotment, and longer possession timelines — and more established, ready or near-ready property in Greater Noida’s GNIDA sectors that sit along the same Yamuna Expressway corridor, offering a practical, faster way to gain exposure to this growth story today.',
      "Growperty's current live inventory falls into the second category — verified flats, plots and commercial units across Greater Noida sectors such as Phi, Chi and Sector 128, each roughly a 30-40 minute drive from the airport site via the expressway, with far more immediate possession and resale liquidity than raw YEIDA land.",
      'As the airport nears completion and surrounding infrastructure (the Film City project, logistics parks, metro extensions) gets built out, we expect inventory and buyer interest in the immediate airport-adjacent sectors to grow significantly — we’re actively onboarding verified listings in these areas and will notify interested buyers as they go live.',
      "Whatever the exact location, always verify a property's current approvals, tenure and realistic possession timeline before investing in any airport-corridor real estate — infrastructure-driven markets can move fast, but authority timelines don't always keep pace with buyer expectations. Browse our current nearby listings below, or post your requirement so we can match you with the right option as new inventory comes online.",
    ]}
    priceRows={[
      { type: 'Flats (1-3 BHK)', range: '₹25 Lac – ₹1.5 Cr' },
      { type: 'Residential Plots', range: '₹60,000 – ₹1,20,000 / sq.yd' },
      { type: 'Commercial / Shops', range: '₹15,000 – ₹30,000 / sq.ft' },
    ]}
    connectivity={[
      { icon: Plane, title: 'Airport Access', desc: 'Roughly 30-40 minutes from the Noida International Airport site via the Yamuna Expressway.' },
      { icon: Road, title: 'Expressway Network', desc: 'The Yamuna Expressway and Noida-Greater Noida Expressway connect this belt to Delhi, Noida, Agra and Mathura.' },
      { icon: Train, title: 'Metro & Transit Plans', desc: 'Long-term transit plans include metro extensions toward the airport corridor.' },
      { icon: MapPin, title: 'Established Sectors', desc: 'Live inventory today is concentrated in Greater Noida’s ready, GNIDA-planned sectors.' },
    ]}
    faqs={[
      { q: 'How close is Greater Noida to the Noida International Airport?', a: 'Most Greater Noida sectors are roughly a 30-40 minute drive from the airport site at Jewar via the Yamuna Expressway, once the corridor is fully operational.' },
      { q: 'When will the Noida International Airport be operational?', a: 'The airport has been under phased development with target timelines announced by the authorities; we recommend checking the latest official updates, as construction timelines for large infrastructure projects can shift.' },
      { q: 'Can I buy property directly inside the airport-influence YEIDA sectors?', a: "Some YEIDA sectors near the airport are available through authority allotment schemes rather than typical resale listings, and often come with longer possession timelines. Growperty's current live inventory is concentrated in nearby, ready Greater Noida sectors — post your requirement if you're specifically looking for YEIDA allotments and we'll help guide you." },
      { q: 'Is investing near the airport a safe bet?', a: 'The airport is a major long-term growth driver, but like any infrastructure-linked investment, it carries timeline and execution risk. We recommend verifying current project status and consulting a financial advisor alongside browsing our verified listings.' },
    ]}
    mapQuery="Noida International Airport, Jewar, Uttar Pradesh"
    listingsHeading="Properties Near the Airport Corridor"
    listingsFilter={{ city: 'Greater Noida' }}
    requirementContext={{ city: 'Greater Noida', areas: ['Noida International Airport'] }}
  />
);

export default PropertyNearNoidaAirportPage;
