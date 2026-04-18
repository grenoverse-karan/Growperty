import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Youtube, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const {
    isAdminAuthenticated
  } = useAdminAuth();
  return <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-xl">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold text-foreground tracking-tight">Growperty<span className="text-primary">.com</span></span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground">A Venture of Grenoverse Multi Ventures LLP (Formerly SHUBH GRIHA PROPTECH)</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[30ch] font-medium">
                Your trusted real estate partner in Noida & Greater Noida. We connect buyers, sellers with best properties.
              </p>
              <p className="text-sm font-bold text-primary flex items-center gap-1 mt-2">
                Made in Bharat 🇮🇳
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="https://instagram.com/growperty" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all duration-200" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/growperty" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all duration-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/@growperty" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all duration-200" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-base font-bold text-foreground mb-6 block">Quick Links</span>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Properties</Link>
              </li>
              <li>
                <Link to="/list-property" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Sell Property</Link>
              </li>
              <li>
                <Link to="/about" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-base font-bold text-foreground mb-6 block">Legal & Admin</span>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200">Terms of Service</Link>
              </li>
              <li>
                <span className="text-base font-medium text-muted-foreground">RERA Disclaimer</span>
              </li>
              <li className="pt-4">
                {!isAdminAuthenticated ? <Link to="/admin-login" className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors duration-200">
                    <ShieldAlert className="h-4 w-4" /> Admin Login
                  </Link> : <Link to="/admin-dashboard" className="text-sm font-bold text-primary flex items-center gap-1 transition-colors duration-200">
                    <ShieldAlert className="h-4 w-4" /> Admin Dashboard
                  </Link>}
              </li>
            </ul>
          </div>

          <div>
            <span className="text-base font-bold text-foreground mb-6 block">Office Contact</span>
            <ul className="space-y-5">
              <li className="flex items-start space-x-3 text-base font-medium text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="leading-snug">
                  01, Mannat Tower, Bindal Enclave,<br />
                  Sec. Phi-4, near Honda Chowk,<br />
                  Greater Noida, UP
                </span>
              </li>
              <li className="flex items-start space-x-3 text-base font-medium text-muted-foreground">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <div className="flex flex-col space-y-1">
                  <a href="tel:+919953537876" className="hover:text-primary transition-colors duration-200">+91 9891117876</a>
                  <a href="tel:+919971007876" className="hover:text-primary transition-colors duration-200">+91 9971007876</a>
                </div>
              </li>
              <li className="flex items-center space-x-3 text-base font-medium text-muted-foreground">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <a href="mailto:info@growperty.com" className="hover:text-primary transition-colors duration-200">info@growperty.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-center text-sm font-medium text-muted-foreground">
            © {currentYear} Growperty.com. A venture of Grenoverse Multi Ventures LLP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;