import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Message sent successfully', {
        description: 'We will get back to you within 24 hours.'
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
          <Input
            id="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
          />
          {errors.name && <p className="text-sm text-destructive font-medium">{errors.name}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
          />
          {errors.email && <p className="text-sm text-destructive font-medium">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="subject" className="text-sm font-semibold">Subject *</Label>
        <Input
          id="subject"
          placeholder="What is this regarding?"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${errors.subject ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
        />
        {errors.subject && <p className="text-sm text-destructive font-medium">{errors.subject}</p>}
      </div>

      <div className="space-y-3">
        <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
        <Textarea
          id="message"
          placeholder="Tell us more about your inquiry..."
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={6}
          className={`rounded-xl bg-slate-50 dark:bg-slate-800/50 resize-none ${errors.message ? 'border-destructive focus-visible:ring-destructive' : 'focus-visible:ring-primary'}`}
        />
        {errors.message && <p className="text-sm text-destructive font-medium">{errors.message}</p>}
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto h-12 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;