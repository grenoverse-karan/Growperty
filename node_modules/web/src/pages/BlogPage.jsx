
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Home, TrendingUp } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';

const blogPosts = [
  {
    id: 1,
    title: 'Top 5 Emerging Neighborhoods in Noida for 2026',
    description: 'Discover the hidden gems offering the highest ROI and exceptional lifestyle amenities in the expanding NCR region.',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324',
    category: 'Market Trends',
    date: 'Apr 12, 2026',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Understanding RERA Guidelines: A Buyer\'s Guide',
    description: 'Navigate the legalities of real estate with our comprehensive breakdown of RERA compliance and your rights as a buyer.',
    image: 'https://images.unsplash.com/photo-1631027376881-bc619c9535c5',
    category: 'Legal',
    date: 'Apr 05, 2026',
    readTime: '8 min read'
  },
  {
    id: 3,
    title: 'How to Stage Your Home for a Quick Sale',
    description: 'First impressions matter. Learn the interior design tricks that make buyers fall in love with your property instantly.',
    image: 'https://images.unsplash.com/photo-1643732994186-6755311b4306',
    category: 'Selling Tips',
    date: 'Mar 28, 2026',
    readTime: '4 min read'
  },
  {
    id: 4,
    title: 'The Rise of Smart Villas in Greater Noida West',
    description: 'Automation, sustainability, and luxury are merging. Take a look inside the modern smart homes redefining luxury living.',
    image: 'https://images.unsplash.com/photo-1627616010739-78ee1aacf431',
    category: 'Lifestyle',
    date: 'Mar 20, 2026',
    readTime: '6 min read'
  },
  {
    id: 5,
    title: 'Commercial vs Residential Investment: Which Wins?',
    description: 'Analyzing the long-term yields, rental income potential, and risks associated with commercial and residential assets.',
    image: 'https://images.unsplash.com/photo-1680883344524-97958ce6b59a',
    category: 'Investment',
    date: 'Mar 15, 2026',
    readTime: '7 min read'
  },
  {
    id: 6,
    title: 'Decoding the YEIDA Master Plan 2031',
    description: 'What the upcoming airport and infrastructure developments mean for property values along the Yamuna Expressway.',
    image: 'https://images.unsplash.com/photo-1701723840878-52c98efbd9ec',
    category: 'Infrastructure',
    date: 'Mar 08, 2026',
    readTime: '10 min read'
  }
];

const BlogPage = () => {
  // Separate the first post to feature it differently
  const featuredPost = blogPosts[0];
  const regularPosts = blogPosts.slice(1);

  return (
    <>
      <Helmet>
        <title>Blog & Market Insights | Growperty.com</title>
        <meta name="description" content="Stay informed with the latest property tips, market trends, and real estate insights in Noida, Greater Noida, and YEIDA." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="relative pt-24 pb-28 overflow-hidden bg-brand-blue dark:bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-slate-900 to-slate-950 opacity-95 z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 mix-blend-overlay z-0 bg-cover bg-center" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold tracking-widest uppercase mb-8 shadow-lg shadow-emerald-900/20">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Growperty Journal
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance leading-tight">
                  Property Tips & Market Insights
                </h1>
                <p className="text-lg md:text-xl text-blue-100 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                  Stay informed. Make smarter property decisions with expert advice, local trends, and actionable real estate guides.
                </p>
              </motion.div>
            </div>
          </section>

          {/* BLOG GRID SECTION */}
          <section className="py-20 bg-slate-50 dark:bg-slate-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white tracking-tight">
                    Latest Articles
                  </h2>
                  <div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full" />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Featured Post - Takes up 2 columns on tablet/desktop */}
                <motion.article 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 lg:col-span-2 group bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 border border-border/50 transition-all duration-300 flex flex-col md:flex-row"
                >
                  <div className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden relative">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      {featuredPost.category}
                    </div>
                  </div>
                  <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center text-sm text-muted-foreground mb-4 font-medium">
                      <span>{featuredPost.date}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-brand-blue dark:text-white mb-4 leading-snug group-hover:text-emerald-600 transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium mb-8 line-clamp-3">
                      {featuredPost.description}
                    </p>
                    <div className="mt-auto">
                      <Button variant="outline" className="font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors group/btn h-12 px-6 rounded-xl">
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.article>

                {/* Regular Posts Grid */}
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-blue/5 hover:-translate-y-1 border border-border/50 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground mb-3 font-medium">
                        <span>{post.date}</span>
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-brand-blue dark:text-white mb-3 leading-snug group-hover:text-emerald-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground font-medium line-clamp-2 mb-6">
                        {post.description}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center text-emerald-600 font-bold text-sm group-hover:underline underline-offset-4 decoration-2">
                          Read More
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {/* NEWSLETTER SECTION */}
          <section className="py-24 bg-muted/50 border-y border-border/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-10 md:p-14 shadow-lg border border-border/60 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-brand-blue/10 blur-3xl rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
                    Get Property Tips in Your WhatsApp
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 font-medium max-w-xl mx-auto">
                    Join our exclusive WhatsApp channel for real-time market updates, prime new listings, and verified investment tips.
                  </p>
                  <Button 
                    asChild 
                    size="lg" 
                    className="h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
                  >
                    <a 
                      href="https://wa.me/919891117876" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Join WhatsApp Channel
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* BOTTOM CTA SECTION */}
          <section className="py-24 bg-white dark:bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white mb-10 tracking-tight">
                  Ready to Buy or Sell?
                </h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                  >
                    <Link to="/properties">
                      <Home className="mr-2 h-5 w-5" />
                      Browse Properties
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline"
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 dark:border-brand-blue-foreground dark:text-brand-blue-foreground dark:hover:bg-brand-blue-foreground/10 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <Link to="/list-property">
                      List Your Property
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;
