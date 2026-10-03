import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label.jsx';
import { Input } from '@/components/ui/input.jsx';

function formatINR(n) {
  if (!isFinite(n)) return '₹0';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Standard reducing-balance EMI — shared with the per-property calculator.
export function calculateEmi(loanAmount, interestRate, tenureYears) {
  const p = Number(loanAmount) || 0;
  const r = (Number(interestRate) || 0) / 12 / 100;
  const n = (Number(tenureYears) || 0) * 12;
  if (p <= 0 || r <= 0 || n <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0, principalPct: 100 };
  }
  const factor = Math.pow(1 + r, n);
  const monthlyEmi = (p * r * factor) / (factor - 1);
  const total = monthlyEmi * n;
  const interest = total - p;
  return {
    emi: monthlyEmi,
    totalInterest: interest,
    totalPayment: total,
    principalPct: total > 0 ? (p / total) * 100 : 100,
  };
}

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const { emi, totalInterest, totalPayment, principalPct } = useMemo(
    () => calculateEmi(loanAmount, interestRate, tenureYears),
    [loanAmount, interestRate, tenureYears]
  );

  return (
    <section className="py-20 md:py-24 bg-slate-50 dark:bg-slate-900/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#10B981]/10 rounded-2xl mb-4">
            <Calculator className="w-7 h-7 text-[#10B981]" />
          </div>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Home Loan EMI Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Estimate your monthly EMI before you buy. Adjust the loan amount, interest rate, and tenure to plan your budget.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loan Amount (₹)</Label>
              <Input
                type="number"
                min={0}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold"
              />
              <input
                type="range"
                min={100000}
                max={50000000}
                step={50000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full accent-[#10B981]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Interest Rate (% p.a.)</Label>
              <Input
                type="number"
                min={0}
                step={0.05}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold"
              />
              <input
                type="range"
                min={5}
                max={16}
                step={0.05}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full accent-[#10B981]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loan Tenure (Years)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold"
              />
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full accent-[#10B981]"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col justify-center">
            <div className="bg-gradient-to-br from-[#10B981] to-emerald-600 rounded-2xl p-8 text-center mb-6 shadow-lg shadow-emerald-500/20">
              <p className="text-emerald-50 text-sm font-bold uppercase tracking-wider mb-2">Monthly EMI</p>
              <p className="text-4xl font-extrabold text-white tracking-tight">{formatINR(emi)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Total Interest</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatINR(totalInterest)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Total Payment</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatINR(totalPayment)}</p>
              </div>
            </div>

            {/* Principal vs Interest bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
                <span>Principal</span>
                <span>Interest</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden bg-amber-200 flex">
                <div className="h-full bg-[#10B981]" style={{ width: `${principalPct}%` }} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
              This is an estimate for planning purposes only. Actual EMI may vary based on your lender's terms, processing fees, and approval.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
