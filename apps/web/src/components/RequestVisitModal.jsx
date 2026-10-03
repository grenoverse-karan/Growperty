import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { getCpRefAttribution } from '@/lib/cpRef.js';
import { getVisitorToken } from '@/lib/cpVisitorTracking.js';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}
function getMaxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

/**
 * A property-agnostic "Request a Visit" CTA for locality/category landing
 * pages that aren't tied to one specific listing. There's no single
 * propertyId to attach here (unlike VisitRequestModal), so this submits to
 * /requirements — the same general buyer-interest capture used by the
 * "Post Requirement" flow — pre-filled with the page's propertyType/city/area
 * context and the visit date/notes folded into specialRequirements.
 */
export default function RequestVisitModal({ open, onClose, pageLabel, propertyType, city, areas = [] }) {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', date: '', message: '' });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return setError('Enter a valid 10-digit Indian mobile number.');

    setLoading(true);
    try {
      const sitewideRef = getCpRefAttribution();
      const visitorToken = getVisitorToken();
      const notes = [
        `Visit request from "${pageLabel}" page.`,
        form.date && `Preferred date: ${form.date}.`,
        form.message.trim(),
      ].filter(Boolean).join(' ');

      const res = await apiServerClient.fetch('/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: form.name.trim(),
          buyerPhone: form.phone.trim(),
          ...(propertyType && { propertyType }),
          ...(city && { city }),
          ...(areas.length && { areas }),
          specialRequirements: notes,
          status: 'active',
          ...(sitewideRef && sitewideRef),
          ...(visitorToken && { visitorToken }),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Submission failed.');
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
    setForm({ name: '', phone: '', date: '', message: '' });
    onClose();
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
              <DialogTitle className="text-xl font-bold text-slate-900">Request Sent!</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Our team will reach out on <span className="font-semibold text-slate-700">{form.phone}</span> to confirm your visit.
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
                Share your details and our team will arrange a site visit for you.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="rv-name">Your Name <span className="text-red-500">*</span></Label>
                <Input id="rv-name" name="name" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rv-phone">Mobile Number <span className="text-red-500">*</span></Label>
                <Input id="rv-phone" name="phone" type="tel" placeholder="10-digit number"
                  maxLength={10} value={form.phone} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rv-date">Preferred Date <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                <Input id="rv-date" name="date" type="date"
                  min={getTodayStr()} max={getMaxDateStr()}
                  value={form.date} onChange={handleChange} className="h-10 rounded-lg" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rv-message">Message <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                <Textarea id="rv-message" name="message" placeholder="Budget, BHK preference, or any specific requirement..."
                  rows={2} value={form.message} onChange={handleChange} className="rounded-lg resize-none text-sm" />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 font-bold rounded-xl text-base">
                {loading ? 'Submitting...' : 'Request Visit'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
