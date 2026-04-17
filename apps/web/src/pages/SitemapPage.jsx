
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { 
  Home, Search, Building, TrendingUp, 
  MapPin, Info, Phone, Shield, ChevronRight, MessageCircle, PhoneCall, Mail
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';

const sitemapData = [
  {
    title: 'Main Pages',
    icon: Home,
    links: [
      { label: 'Home', path: '/' },
      { label: 'Properties', path: '/properties' },
      { label: 'Projects', path: '/projects' },
      { label: 'Sell Property', path: '/list-property' },
      { label: 'Add Requirement', path: '/post-requirement' },
      { label: 'Login / Signup', path: '/login' },
    ]
  },
  {
    title: 'For Buyers',
    icon: Search,
    links: [
      { label: 'Browse Properties', path: '/properties' },
      { label: 'Add Requirement', path: '/post-requirement' },
      { label: 'Property Alert', path: '/post-requirement' },
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
  {
    title: 'For Sellers',
    icon: Building,
    links: [
      { label: 'Sell Property', path: '/list-property' },
      { label: 'List Project', path: '/sell-property' },
      { label: 'Fast Track', path: '/fast-track' },
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
  {
    title: 'Investment',
    icon: TrendingUp,
    links: [
      { label: 'Investor Page', path: '/invest' },
      { label: 'Projects', path: '/projects' },
      { label: 'Blog & Tips', path: '/blog' },
      { label: 'Fast Track', path: '/fast-track' },
    ]
  },
  {
    title: 'Area Guides',
    icon: MapPin,
    links: [
      { label: 'Greater Noida Guide', path: '/area-guide/greater-noida' },
      { label: 'Noida Guide', path: '/area-guide/noida' },
      { label: 'YEIDA Guide', path: '/area-guide/yeida' },
    ]
  },
  {
    title: 'Information',
    icon: Info,
    links: [
      { label: 'About', path: '/about' },
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'Fast Track', path: '/fast-track' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Success Stories', path: '/about' },
      { label: 'Sitemap', path: '/sitemap' },
    ]
  },
  {
    title: 'Support & Contact',
    icon: Phone,
    links: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'Property Alert', path: '/post-requirement' },
      { label: 'WhatsApp', path: 'https://wa.me/919953537876', external: true },
      { label: 'Call (+919953537876)', path: 'tel:+919953537876', external: true },
    ]
  },
  {
    title: 'Legal & Admin',
    icon: Shield,
    links: [
      { label: 'Privacy Policy', path: '/terms-and-conditions' },
      { label: 'Terms', path: '/terms-and-conditions' },
      { label: 'RERA Disclaimer', path: '/terms-and-conditions' },
      { label: 'Admin Login', path: '/admin-login' },
    ]
  }
];

const SitemapPage = () => {
  return (
    <>
      <Helmet>
        <title>Sitemap - Growperty.com</title>
        <meta name="description" content="Complete sitemap of Growperty.com. Find properties, projects, area guides, and more across Greater Noida, Noida, and YEIDA." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight text-balance">
                Sitemap
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                Find everything on Growperty.com. Navigate through our comprehensive real estate platform.
              </p>
            </div>
          </section>

          {/* Sitemap Grid */}
          <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {sitemapData.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={index} 
                      className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      
                      <ul className="space-y-3">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            {link.external ? (
                              <a 
                                href={link.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center text-slate-600 dark:text-slate-400 hover:text-[#10B981] dark:hover:text-[#10B981] font-medium transition-colors text-[15px]"
                              >
                                <ChevronRight className="w-4 h-4 mr-2 text-slate-300 dark:text-slate-700 group-hover:text-[#10B981] transition-colors" />
                                {link.label}
                              </a>
                            ) : (
                              <Link 
                                to={link.path}
                                className="group flex items-center text-slate-600 dark:text-slate-400 hover:text-[#10B981] dark:hover:text-[#10B981] font-medium transition-colors text-[15px]"
                              >
                                <ChevronRight className="w-4 h-4 mr-2 text-slate-300 dark:text-slate-700 group-hover:text-[#10B981] transition-colors" />
                                {link.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact Box */}
          <section className="py-20 bg-[#0a1128] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjMWZhODVlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Need Help Finding Something?
              </h2>
              <p className="text-lg text-slate-300 font-medium mb-8">
                Our team is here to help you. Reach out to us directly at <span className="text-white font-bold">+91 9953537876</span> or <a href="mailto:info@growperty.com" className="text-[#10B981] hover:underline">info@growperty.com</a>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-xl h-14 px-8 shadow-lg shadow-emerald-900/20"
                >
                  <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp Us
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-slate-600 text-white hover:bg-slate-800 hover:text-white font-bold rounded-xl h-14 px-8 bg-transparent"
                >
                  <a href="tel:+919953537876">
                    <PhoneCall className="w-5 h-5 mr-2" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default SitemapPage;
