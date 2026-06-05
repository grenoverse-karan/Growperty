
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Home, TrendingUp, Loader2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
function loadBloggerPosts() {
  return new Promise((resolve, reject) => {
    const cb = `__blogger_${Date.now()}`;
    const script = document.createElement('script');
    script.src = `https://growperty.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=12&callback=${cb}`;

    window[cb] = (data) => {
      delete window[cb];
      script.remove();
      const entries = data?.feed?.entry || [];
      resolve(entries.map(entry => {
        const link = entry.link?.find(l => l.rel === 'alternate')?.href || 'https://growperty.blogspot.com';
        const rawDate = entry.published?.$t;
        const date = rawDate
          ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';
        let image = entry.media$thumbnail?.url?.replace(/\/s[0-9]+-c\//, '/s800/') || null;
        if (!image && entry.content?.$t) {
          const m = entry.content.$t.match(/<img[^>]+src="([^"]+)"/i);
          if (m) image = m[1];
        }
        const wordCount = entry.content?.$t?.replace(/<[^>]*>/g, '').split(/\s+/).length || 300;
        const description = entry.summary?.$t?.replace(/<[^>]*>/g, '').trim().slice(0, 200) || '';
        return {
          id: link,
          title: entry.title?.$t || 'Untitled',
          description,
          image,
          category: entry.category?.[0]?.term || 'General',
          date,
          readTime: `${Math.max(2, Math.ceil(wordCount / 200))} min read`,
          link,
        };
      }));
    };

    script.onerror = () => { delete window[cb]; script.remove(); reject(new Error('load failed')); };
    document.head.appendChild(script);
  });
}

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBloggerPosts()
      .then(parsed => { setPosts(parsed); setLoading(false); })
      .catch(() => { setError('Could not load articles. Please try again later.'); setLoading(false); });
  }, []);

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

              {loading && (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                </div>
              )}

              {error && (
                <div className="text-center py-24 text-muted-foreground font-medium">{error}</div>
              )}

              {!loading && !error && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <motion.a
                      key={post.id}
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-slate-950 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 border border-border/50 transition-all duration-300 flex flex-col p-6 md:p-7"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-500/10 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-3 font-medium gap-2">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-brand-blue dark:text-white mb-3 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-3">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-5">
                          {post.description}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t border-border/40">
                        <span className="inline-flex items-center text-emerald-600 font-bold text-sm group-hover:gap-2 gap-1 transition-all">
                          Read More
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}

              {!loading && !error && posts.length === 0 && (
                <div className="text-center py-24 text-muted-foreground font-medium">No articles found.</div>
              )}
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
