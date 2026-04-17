import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Building2, Target, Users, ShieldCheck, Globe } from 'lucide-react';
const AboutPage = () => {
  const values = [{
    icon: Target,
    title: 'Our Mission',
    description: 'To simplify the real estate journey by providing transparent, reliable, and comprehensive property solutions that empower our clients to make informed decisions.'
  }, {
    icon: Globe,
    title: 'Our Vision',
    description: 'To be the most trusted and innovative real estate platform in Bharat, setting new standards for customer experience and market transparency.'
  }, {
    icon: Users,
    title: 'Client First',
    description: 'We prioritize our clients\' needs above all else, ensuring personalized service and dedicated support throughout every step of the buying, selling, or renting process.'
  }, {
    icon: ShieldCheck,
    title: 'Trust & Integrity',
    description: 'Built on a foundation of honesty, we maintain the highest ethical standards in all our dealings, fostering long-term relationships based on mutual trust.'
  }];
  return <>
      <Helmet>
        <title>About Us - Growperty.com</title>
        <meta name="description" content="Learn more about Growperty, a venture of Grenoverse Multi Ventures LLP. Your trusted real estate partner in Noida, Greater Noida, and Delhi-NCR." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-primary text-primary-foreground py-20 md:py-28 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5
            }} className="max-w-3xl">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight" style={{
                textWrap: 'balance'
              }}>
                  Redefining Real Estate Excellence in Bharat
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed font-medium max-w-[60ch]">
                  Growperty.com is a premier real estate platform dedicated to connecting people with their perfect spaces across Noida, Greater Noida, and Delhi-NCR.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Company Info & Values */}
          <section className="py-20 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                <motion.div initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5
              }}>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                    Who We Are
                  </h2>
                  <p className="text-primary font-bold text-lg mb-6">A venture of Grenoverse Multi Ventures LLP (Formerly SHUBH GRIHA PROPTECH)</p>
                  <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                    <p>
                      Founded with a vision to transform the property market, Growperty has quickly established itself as a trusted name in real estate. We understand that buying or selling a property is more than just a transaction—it's a life-changing experience.
                    </p>
                    <p>
                      Proudly <strong>Made in Bharat</strong>, our platform combines deep local market knowledge with innovative technology. We specialize in premium residential and commercial properties across the rapidly growing corridors of Noida, Greater Noida, Yamuna Expressway, and the wider Delhi-NCR region.
                    </p>
                    <p>
                      Whether you are a first-time homebuyer, a seasoned investor, or looking to list your property, our team of seasoned professionals provides the strategic guidance and support you need to succeed.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div initial={{
                opacity: 0,
                x: 20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5
              }} className="grid sm:grid-cols-2 gap-6">
                  {values.map((value, index) => {
                  const Icon = value.icon;
                  return <Card key={index} className="border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow h-full">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors mb-4">
                            <Icon className="h-6 w-6 text-secondary" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                          <p className="text-muted-foreground font-medium leading-relaxed text-sm flex-grow">
                            {value.description}
                          </p>
                        </CardContent>
                      </Card>;
                })}
                </motion.div>
              </div>

              {/* Office Location Section */}
              <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5
            }}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                    Visit Our Office
                  </h2>
                  <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                    We'd love to meet you in person. Drop by our headquarters to discuss your real estate needs with our expert team.
                  </p>
                </div>

                <Card className="rounded-3xl shadow-xl border-border/50 overflow-hidden bg-white dark:bg-slate-900/80">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                          <MapPin className="h-7 w-7 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Headquarters</p>
                          <h3 className="text-xl font-bold text-foreground mb-2">Growperty Main Office</h3>
                          <p className="text-base text-muted-foreground leading-relaxed font-medium">
                            01, Mannat Tower, Bindal Enclave,<br />
                            Sec. Phi-4, near Honda Chowk,<br />
                            Greater Noida, UP
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-px bg-border/60"></div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Phone className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Call Us</p>
                          <div className="flex flex-col space-y-1">
                            <a href="tel:+919953537876" className="text-lg font-bold text-foreground hover:text-primary transition-colors">+91 9953537876</a>
                            <a href="tel:+919971007876" className="text-lg font-bold text-foreground hover:text-primary transition-colors">+91 9971007876</a>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-px bg-border/60"></div>

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Email Us</p>
                          <a href="mailto:info@growperty.com" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                            info@growperty.com
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-200 dark:bg-slate-800 min-h-[300px] md:min-h-full relative">
                      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.959208162311!2d77.5156!3d28.4506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDI3JzAyLjIiTiA3N8KwMzAnNTYuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" width="100%" height="100%" style={{
                      border: 0
                    }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Growperty Office Location" className="absolute inset-0"></iframe>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>;
};
export default AboutPage;