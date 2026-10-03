import React, { useMemo, useState } from 'react';
import { calculateEmi } from '@/components/EMICalculator.jsx';
import { formatPriceInWords } from '@/lib/priceUtils.js';

function formatINR(n) {
  if (!isFinite(n)) return '₹0';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Compact "₹2.5 Crore" / "₹40 Lakh" for the small summary tiles.
const formatShort = (n) => (n > 0 ? `₹${formatPriceInWords(Math.round(n))}` : '₹0');

const SliderField = ({ label, valueLabel, min, max, step, value, onChange, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <span className="font-extrabold text-slate-900 dark:text-white">{valueLabel}</span>
    </div>
    {children}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#10B981]"
    />
  </div>
);

// EMI calculator on the property details page — pre-filled from this
// listing's price, so the buyer only picks down payment, rate and tenure.
export default function PropertyEMICalculator({ price }) {
  const propertyPrice = Number(price) || 0;
  // Down payment is held in rupees so it can be typed exactly; the slider
  // just sets it as a % of the price.
  const [downPayment, setDownPayment] = useState(() => Math.round(propertyPrice * 0.2));
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const loanAmount = Math.max(propertyPrice - downPayment, 0);
  const downPaymentPct = propertyPrice > 0 ? (downPayment / propertyPrice) * 100 : 0;

  const handleDownPaymentInput = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, '');
    setDownPayment(Math.min(Number(digits) || 0, propertyPrice));
  };

  const { emi, totalInterest, totalPayment, principalPct } = useMemo(
    () => calculateEmi(loanAmount, interestRate, tenureYears),
    [loanAmount, interestRate, tenureYears]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Property Price</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{formatShort(propertyPrice)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Loan Amount</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{formatShort(loanAmount)}</p>
          </div>
        </div>

        <SliderField
          label="Down Payment"
          valueLabel={`${Number(downPaymentPct.toFixed(1))}% · ${formatShort(downPayment)}`}
          min={0} max={90} step={5}
          value={Math.round(downPaymentPct)}
          onChange={(pct) => setDownPayment(Math.round((propertyPrice * pct) / 100))}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Down payment amount in rupees"
              value={downPayment ? downPayment.toLocaleString('en-IN') : ''}
              onChange={handleDownPaymentInput}
              placeholder="Enter amount"
              className="w-full h-10 pl-7 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
            />
          </div>
        </SliderField>
        <SliderField
          label="Interest Rate"
          valueLabel={`${interestRate.toFixed(2)}% p.a.`}
          min={6} max={15} step={0.05}
          value={interestRate}
          onChange={setInterestRate}
        />
        <SliderField
          label="Loan Tenure"
          valueLabel={`${tenureYears} years`}
          min={1} max={30} step={1}
          value={tenureYears}
          onChange={setTenureYears}
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="bg-gradient-to-br from-[#10B981] to-emerald-600 rounded-2xl p-5 text-center mb-4 shadow-lg shadow-emerald-500/20">
          <p className="text-emerald-50 text-xs font-bold uppercase tracking-wider mb-1">Monthly EMI</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{formatINR(emi)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Total Interest</p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatShort(totalInterest)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Total Payment</p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatShort(totalPayment)}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
            <span>Principal</span>
            <span>Interest</span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden bg-amber-200 flex">
            <div className="h-full bg-[#10B981]" style={{ width: `${principalPct}%` }} />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          Estimate only. Actual EMI depends on your lender's rate, processing fees and loan approval.
        </p>
      </div>
    </div>
  );
}
