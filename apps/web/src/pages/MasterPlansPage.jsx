import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Eye, MapPin } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog.jsx';
import masterPlans from '@/data/masterPlans.js';

const MasterPlansPage = () => {
  const [preview, setPreview] = useState(null);

  return (
    <>
      <Helmet>
        <title>Download Master Plans - Greater Noida & YEIDA - Growperty.com</title>
        <meta
          name="description"
          content="Download official master plans for Greater Noida and Yeida (Yamuna Expressway) - 2021, 2031, and 2041 land use plans."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
        <Header />

        <main className="flex-1">
          <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#10B981]/10 rounded-2xl mb-4">
                <MapPin className="w-7 h-7 text-[#10B981]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight text-balance">
                Master Plans
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                Official land-use master plans for Greater Noida and Yeida (Yamuna Expressway) — view any plan or download it individually.
              </p>
            </div>
          </section>

          <section className="py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {masterPlans.map((plan) => (
                  <div
                    key={plan.file}
                    className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setPreview(plan)}
                      className="block aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
                    >
                      <img
                        src={`/master-plans/${plan.file}`}
                        alt={`${plan.name} master plan`}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </button>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {plan.name}
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-lg font-semibold"
                          onClick={() => setPreview(plan)}
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 rounded-lg font-semibold bg-[#10B981] hover:bg-emerald-600 text-white"
                        >
                          <a href={`/master-plans/${plan.file}`} download={`${plan.name}.jpg`}>
                            <Download className="w-4 h-4 mr-1.5" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-4xl p-2 sm:p-4">
          <DialogTitle className="sr-only">{preview?.name}</DialogTitle>
          {preview && (
            <div>
              <img
                src={`/master-plans/${preview.file}`}
                alt={`${preview.name} master plan`}
                className="w-full h-auto rounded-lg"
              />
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="font-bold text-slate-900 dark:text-white">{preview.name}</p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg font-semibold bg-[#10B981] hover:bg-emerald-600 text-white"
                >
                  <a href={`/master-plans/${preview.file}`} download={`${preview.name}.jpg`}>
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MasterPlansPage;
