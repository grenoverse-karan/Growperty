import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Eye, MapPin, Search } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import sectorMaps from '@/data/sectorMaps.js';

const ZONES = [
  { id: 'greater-noida', label: 'Greater Noida', maps: sectorMaps },
  { id: 'yeida', label: 'Yeida (Yamuna Expressway)', maps: [] },
];

const MapGrid = ({ maps, onPreview }) => {
  if (!maps.length) {
    return (
      <div className="py-20 text-center">
        <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold">
          Maps for this zone are coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {maps.map((map) => (
        <div
          key={map.file}
          className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
          <button
            type="button"
            onClick={() => onPreview(map)}
            className="block aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900"
          >
            <img
              src={`/sector-maps/${map.file}`}
              alt={`${map.name} sector map`}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </button>
          <div className="p-4 flex flex-col gap-3 flex-1">
            <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
              {map.name}
            </p>
            <div className="mt-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg font-semibold"
                onClick={() => onPreview(map)}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                View
              </Button>
              <Button
                asChild
                size="sm"
                className="flex-1 rounded-lg font-semibold bg-[#10B981] hover:bg-emerald-600 text-white"
              >
                <a href={`/sector-maps/${map.file}`} download={`${map.name}.jpg`}>
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DownloadSectorMapsPage = () => {
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState('');

  const filteredZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ZONES;
    return ZONES.map((zone) => ({
      ...zone,
      maps: zone.maps.filter((m) => m.name.toLowerCase().includes(q)),
    }));
  }, [query]);

  return (
    <>
      <Helmet>
        <title>Download Greater Noida Sector Maps - Growperty.com</title>
        <meta
          name="description"
          content="Download layout/sector maps for all Greater Noida sectors, including Alpha, Beta, Gamma, Delta, Sigma, Omicron, Ecotech, and more."
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
                Download Sector Maps
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                Layout plans for Greater Noida and Yeida (Yamuna Expressway) sectors. Search by name, view, or download any map individually.
              </p>

              <div className="relative max-w-md mx-auto mt-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sector, e.g. Alpha, Delta, Sigma..."
                  className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-semibold"
                />
              </div>
            </div>
          </section>

          <section className="py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Tabs defaultValue={ZONES[0].id}>
                <TabsList className="h-auto flex-wrap gap-1 mb-10">
                  {filteredZones.map((zone) => (
                    <TabsTrigger key={zone.id} value={zone.id} className="px-4 py-2 font-bold">
                      {zone.label}
                      {query.trim() && (
                        <span className="ml-1.5 text-xs opacity-60">({zone.maps.length})</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {filteredZones.map((zone) => (
                  <TabsContent key={zone.id} value={zone.id}>
                    <MapGrid maps={zone.maps} onPreview={setPreview} />
                  </TabsContent>
                ))}
              </Tabs>
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
                src={`/sector-maps/${preview.file}`}
                alt={`${preview.name} sector map`}
                className="w-full h-auto rounded-lg"
              />
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="font-bold text-slate-900 dark:text-white">{preview.name}</p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-lg font-semibold bg-[#10B981] hover:bg-emerald-600 text-white"
                >
                  <a href={`/sector-maps/${preview.file}`} download={`${preview.name}.jpg`}>
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

export default DownloadSectorMapsPage;
