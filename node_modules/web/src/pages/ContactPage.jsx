import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Growperty</title>
        <meta name="description" content="Get in touch with Growperty. We're here to help you find your dream property or answer any questions you may have about our services." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
                Have questions about our properties or services? We're here to help you find your dream home.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-1 space-y-8"
              >
                {/* Prominent Contact Numbers Card */}
                <Card className="rounded-3xl shadow-xl border-none bg-white dark:bg-slate-900/80 overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-2xl font-extrabold">Direct Contact</CardTitle>
                    <CardDescription className="text-base font-medium">
                      Reach our team instantly for immediate assistance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <a 
                      href="tel:+919953537876" 
                      className="btn-call flex items-center justify-center gap-3 w-full h-14 rounded-xl font-bold transition-all active:scale-[0.98] text-lg shadow-md"
                    >
                      <Phone className="h-5 w-5" />
                      +91 9953537876
                    </a>
                    <a 
                      href="https://wa.me/919953537876" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-whatsapp flex items-center justify-center gap-3 w-full h-14 rounded-xl font-bold transition-all active:scale-[0.98] text-lg shadow-md"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      WhatsApp Us
                    </a>
                  </CardContent>
                </Card>

                {/* Office Address Card */}
                <Card className="rounded-3xl shadow-lg border-border/50 bg-white dark:bg-slate-900/50 overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardTitle className="text-xl font-extrabold">Office Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground mb-1">Headquarters</p>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          01, Mannat Tower, Bindal Enclave,<br/>
                          Sec. Phi-4, near Honda Chowk,<br/>
                          Greater Noida
                        </p>
                        <a 
                          href="https://maps.google.com/?q=Mannat+Tower,+Bindal+Enclave,+Sec.+Phi-4,+Greater+Noida" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-sm font-bold text-primary hover:underline"
                        >
                          Get Directions <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground mb-1">Phone Numbers</p>
                        <div className="flex flex-col space-y-1">
                          <a href="tel:+919953537876" className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors">+91 9953537876</a>
                          <a href="tel:+919971007876" className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors">+91 9971007876</a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground mb-1">Email Address</p>
                        <a href="mailto:info@growperty.com" className="text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
                          info@growperty.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground mb-1">Business Hours</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          Monday - Saturday: 9:00 AM - 7:00 PM<br/>
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Map Embed */}
                  <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.959208162311!2d77.5156!3d28.4506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDI3JzAyLjIiTiA3N8KwMzAnNTYuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Growperty Office Location"
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="rounded-3xl shadow-xl border-border/50 bg-white dark:bg-slate-900/50 h-full">
                  <CardHeader className="px-8 pt-8 pb-6 border-b border-border/50">
                    <CardTitle className="text-2xl font-extrabold">Send us a message</CardTitle>
                    <CardDescription className="text-base font-medium">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ContactForm />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;