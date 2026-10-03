import React, { useState } from 'react';
import { Gift, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label';
import { OFFER_TITLE_PRESETS, OFFER_DETAIL_PRESETS } from '@/lib/listingOptions.js';

const DEFAULT_CONTAINER = 'bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800';

/**
 * Optional festive-offer editor shared by the property and project forms:
 * offer name + offer details (preset chips or free text) and a "valid till"
 * date. Collapsed by default so it doesn't crowd the form.
 *
 * `values` holds { offerTitle, offerDetails, offerValidTill };
 * `onChange(name, value)` updates one of them.
 */
const SpecialOfferSection = ({ values, onChange, containerClassName = DEFAULT_CONTAINER, title = 'Special Offer' }) => {
  const [expanded, setExpanded] = useState(false);
  const hasOffer = Boolean(values.offerTitle || values.offerDetails);

  return (
    <div className={`${containerClassName} space-y-5`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between gap-3 text-left ${expanded ? 'border-b border-slate-100 dark:border-slate-800 pb-3' : ''}`}
      >
        <div className="min-w-0">
          <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Gift className="h-5 w-5 text-[#10B981]" />{title} <span className="text-sm font-normal text-muted-foreground">(Optional)</span></span>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {!expanded && hasOffer
              ? <span className="font-semibold text-[#10B981]">{[values.offerTitle, values.offerDetails].filter(Boolean).join(' · ')}</span>
              : 'Running a festive deal? Buyers will see it highlighted on your listing.'}
          </p>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#10B981]">
          {expanded ? 'Show less' : (hasOffer ? 'Edit offer' : 'Add offer')}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {expanded && (<>
        {[
          { name: 'offerTitle', label: 'Offer Name', presets: OFFER_TITLE_PRESETS, placeholder: 'e.g. Diwali Offer — or type your own', maxLength: 60 },
          { name: 'offerDetails', label: 'Offer Details', presets: OFFER_DETAIL_PRESETS, placeholder: 'e.g. 2% Off — or type your own', maxLength: 150 },
        ].map(field => (
          <div key={field.name} className="space-y-2">
            <Label className="form-label mb-0">{field.label}</Label>
            <div className="flex flex-wrap gap-2">
              {field.presets.map(item => {
                const isSelected = values[field.name] === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onChange(field.name, isSelected ? '' : item)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#10B981]/50'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <Input
              name={field.name}
              value={values[field.name]}
              onChange={(e) => onChange(field.name, e.target.value)}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label className="form-label mb-0">Offer Valid Till <span className="text-sm font-normal text-muted-foreground">(Optional)</span></Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              name="offerValidTill"
              value={values.offerValidTill}
              onChange={(e) => onChange('offerValidTill', e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="h-11 max-w-[220px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            {values.offerValidTill && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange('offerValidTill', '')} className="h-9 text-xs text-muted-foreground">
                <X className="h-3.5 w-3.5 mr-1" />Clear
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">The offer disappears from your listing automatically after this date.</p>
        </div>
        <p className="text-[11px] text-muted-foreground">T&amp;C* apply</p>
      </>)}
    </div>
  );
};

export default SpecialOfferSection;
