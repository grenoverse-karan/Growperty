import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

// Default slots for "anytime" (no seller preference set)
const ANYTIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

// Convert seller's fixed slot strings (e.g. "10am–11am") to display labels
function fixedSlotToDisplay(slot) {
  return slot.replace('–', ' – ');
}

// Flexible slot labels
const FLEXIBLE_SLOT_LABELS = {
  '10am–1pm':  'Morning (10 AM – 1 PM)',
  '1pm–4pm':   'Afternoon (1 PM – 4 PM)',
  '4pm–6pm':   'Evening (4 PM – 6 PM)',
};

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}
function getMaxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export default function VisitRequestModal({
  open, onClose, propertyId, propertyLabel,
  visitTimeType, visitFixedSlots = [], visitFlexibleSlots = [],
  currentUser,
}) {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    visitorName: '', visitorPhone: '', visitorCity: '', visitDate: '', visitTime: '', message: '',
  });

  // Auto-fill name / mobile / city from the logged-in user's profile when the modal opens
  useEffect(() => {
    if (open && currentUser) {
      const rawPhone = currentUser.phone || currentUser.phoneNumber || '';
      const phone = String(rawPhone).replace(/^(\+?91)/, '').replace(/\D/g, '').slice(-10);
      setForm(f => ({
        ...f,
        visitorName: f.visitorName || currentUser.name || '',
        visitorPhone: f.visitorPhone || phone,
        visitorCity: f.visitorCity || currentUser.city || '',
      }));
    }
  }, [open, currentUser]);

  // Determine mode: 'anytime' | 'fixed' | 'flexible'
  const mode = visitTimeType || 'anytime';

  // Slots shown to buyer depends on mode
  const fixedSlots = visitFixedSlots?.length ? visitFixedSlots : [];
  const flexibleSlots = visitFlexibleSlots?.length ? visitFlexibleSlots : [];

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }
  function selectTime(slot) {
    setForm(f => ({ ...f, visitTime: slot }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.visitorName.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(form.visitorPhone.trim())) return setError('Enter a valid 10-digit Indian mobile number.');
    if (!form.visitDate) return setError('Please select a visit date.');
    if (!form.visitTime) return setError('Please select a preferred time slot.');

    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/visit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, ...form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed.');
      setStep('success');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep('form');
    setError('');
    setForm({ visitorName: '', visitorPhone: '', visitorCity: '', visitDate: '', visitTime: '', message: '' });
    onClose();
  }

  // ── Time slot section — changes based on seller's preference ──────
  function renderTimeSlots() {
    if (mode === 'fixed' && fixedSlots.length > 0) {
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Preferred Time <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-slate-500">Owner is available during these slots only:</p>
          <div className="flex flex-wrap gap-2">
            {fixedSlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => selectTime(slot)}
                className={`text-sm py-2 px-4 rounded-xl border-2 font-semibold transition-all
                  ${form.visitTime === slot
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
                  }`}
              >
                {fixedSlotToDisplay(slot)}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'flexible' && flexibleSlots.length > 0) {
      return (
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Preferred Time <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-slate-500">Owner is flexible during these windows:</p>
          <div className="flex flex-col gap-2">
            {flexibleSlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => selectTime(slot)}
                className={`text-sm py-3 px-4 rounded-xl border-2 font-semibold text-left transition-all
                  ${form.visitTime === slot
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
                  }`}
              >
                {FLEXIBLE_SLOT_LABELS[slot] || slot}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // anytime (default) — full grid of hourly slots
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Preferred Time <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-5 gap-1.5">
          {ANYTIME_SLOTS.map(slot => (
            <button
              key={slot}
              type="button"
              onClick={() => selectTime(slot)}
              className={`text-xs py-1.5 px-1 rounded-lg border font-medium transition-all
                ${form.visitTime === slot
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full">
        {step === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Visit Request Sent!</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Our team will confirm your visit for{' '}
                <span className="font-semibold text-slate-700">{form.visitDate}</span> at{' '}
                <span className="font-semibold text-slate-700">{form.visitTime}</span>.<br />
                We'll reach out on <span className="font-semibold text-slate-700">{form.visitorPhone}</span>.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-2 w-full rounded-xl h-11 font-bold">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Request a Visit
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {propertyLabel ? `Schedule a visit for: ${propertyLabel}` : 'Choose your preferred date and time.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="visitorName">Your Name <span className="text-red-500">*</span></Label>
                <Input id="visitorName" name="visitorName" placeholder="e.g. Rahul Sharma"
                  value={form.visitorName} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="visitorPhone">Mobile Number <span className="text-red-500">*</span></Label>
                <Input id="visitorPhone" name="visitorPhone" type="tel" placeholder="10-digit number"
                  maxLength={10} value={form.visitorPhone} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="visitorCity">City</Label>
                <Input id="visitorCity" name="visitorCity" placeholder="Your city"
                  value={form.visitorCity} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="visitDate">Preferred Date <span className="text-red-500">*</span></Label>
                <Input id="visitDate" name="visitDate" type="date"
                  min={getTodayStr()} max={getMaxDateStr()}
                  value={form.visitDate} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              {renderTimeSlots()}

              <div className="space-y-1">
                <Label htmlFor="message">Message <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                <Textarea id="message" name="message" placeholder="Any specific requirements or questions..."
                  rows={2} value={form.message} onChange={handleChange} className="rounded-lg resize-none text-sm" />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 font-bold rounded-xl text-base">
                {loading ? 'Submitting...' : 'Submit Visit Request'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
