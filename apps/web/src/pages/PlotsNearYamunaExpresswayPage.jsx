import React from 'react';
import { Route as Road, Plane, Train, MapPin } from 'lucide-react';
import LocalityLandingPage from '@/components/LocalityLandingPage.jsx';

const PlotsNearYamunaExpresswayPage = () => (
  <LocalityLandingPage
    metaTitle="Plots Near Yamuna Expressway, Greater Noida | Growperty.com"
    metaDescription="Residential plots in Greater Noida along the Yamuna Expressway corridor, near the upcoming Noida International Airport. Verified listings."
    canonicalPath="/plots-near-yamuna-expressway"
    badge="Yamuna Expressway Corridor"
    title="Plots Near Yamuna Expressway"
    heroSubtitle="Residential plots in Greater Noida sectors along the Yamuna Expressway corridor — a growth belt driven by the upcoming Noida International Airport."
    stats={[
      { value: '~40 min', label: "To Noida Int'l Airport" },
      { value: '₹60K–₹1.2L', label: 'Price / Sq.yd' },
      { value: 'High', label: 'Appreciation Potential' },
    ]}
    intro={[
      'The Yamuna Expressway corridor has emerged as one of the most closely watched investment belts in the entire NCR, largely on the back of the under-construction Noida International Airport at Jewar. Plots in Greater Noida sectors that sit along or close to this corridor — such as Chi, Phi and the newer YEIDA-adjacent sectors — have attracted strong investor interest over the past few years, with many buyers betting on long-term appreciation as the airport, logistics hubs, and the proposed Film City project come online.',
      'The expressway itself cuts travel time dramatically — Greater Noida to the airport site is roughly a 40-minute drive once the corridor is fully operational, and the same road connects onward to Agra, Mathura and other key NCR destinations. This connectivity has already pushed land prices up in several pockets, though plots here still remain considerably more affordable than equivalent land closer to central Noida or Delhi.',
      "On Growperty, our currently live plot inventory near this corridor is concentrated in Sector Phi 4, a well-established, GNIDA-planned residential sector with wide roads and underground infrastructure — a practical, ready option for buyers who want expressway-adjacent connectivity without waiting on upcoming YEIDA-sector allotments, which often come with longer possession timelines and authority-driven resale restrictions.",
      "As always with expressway-belt land, investors should treat \"upcoming infrastructure\" claims with healthy caution — verify current master plan status, actual registry/freehold conversion for any specific plot, and realistic possession timelines directly with the authority before committing capital. Our team can help connect you with plot options and arrange site visits, but final due diligence is the buyer's responsibility, as outlined in our disclaimer.",
      'Browse our current live listings below, or request a visit to walk the site before deciding.',
    ]}
    priceRows={[
      { type: 'Sector Phi 4 (GNIDA, live inventory)', range: '₹60,000 – ₹90,000 / sq.yd' },
      { type: 'YEIDA-adjacent sectors (upcoming)', range: 'Authority allotment rates — contact us for current pricing' },
    ]}
    connectivity={[
      { icon: Plane, title: 'Airport-Driven Growth', desc: 'The under-construction Noida International Airport at Jewar sits directly on this corridor.' },
      { icon: Road, title: 'Expressway Access', desc: 'Direct access to the Yamuna Expressway, connecting onward to Agra and Mathura.' },
      { icon: Train, title: 'Future Metro Extension', desc: 'Metro connectivity to this belt is part of longer-term regional transit plans.' },
      { icon: MapPin, title: 'Established Sectors Nearby', desc: 'Sector Phi 4 and neighbouring GNIDA sectors offer ready, live plot inventory today.' },
    ]}
    faqs={[
      { q: 'How far is the Noida International Airport from these plots?', a: 'Once fully operational, the Yamuna Expressway corridor puts most Greater Noida sectors roughly 30-40 minutes from the airport site at Jewar, depending on the exact sector and traffic conditions.' },
      { q: 'Are plots near the Yamuna Expressway freehold?', a: 'Plots in established GNIDA sectors like Phi 4 are typically freehold once conversion and dues are cleared; YEIDA-allotted plots closer to the airport often follow a different, authority-driven allotment and resale process — always verify tenure directly with the relevant authority before buying.' },
      { q: 'Is this a good time to invest in this corridor?', a: 'The corridor has strong long-term growth drivers (airport, Film City, logistics hubs), but infrastructure timelines can shift — we recommend verifying current project status and consulting a financial advisor alongside our listings before investing.' },
      { q: 'Do you have plots directly inside YEIDA sectors?', a: "Our current live inventory is concentrated in Greater Noida's GNIDA sectors along the corridor; YEIDA-specific listings will be added as they become available — post your requirement and we'll notify you." },
    ]}
    mapQuery="Yamuna Expressway, Greater Noida, Uttar Pradesh"
    listingsHeading="Plots Near the Yamuna Expressway Corridor"
    listingsFilter={{ propertyType: 'Plot/Land', city: 'Greater Noida' }}
    requirementContext={{ propertyType: 'Plot/Land', city: 'Greater Noida', areas: ['Yamuna Expressway'] }}
  />
);

export default PlotsNearYamunaExpresswayPage;
