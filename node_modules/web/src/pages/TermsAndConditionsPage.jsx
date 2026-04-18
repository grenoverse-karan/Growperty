import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, AlertTriangle, Mail } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const TermsAndConditionsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Growperty.com</title>
        <meta name="description" content="Read the terms and conditions for using Growperty.com property listing platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Link>
            </Button>

            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Terms and Conditions</h1>
                  <p className="text-muted-foreground mt-2 font-medium">Last updated: March 26, 2026</p>
                </div>
              </div>

              <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">
                
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> 1. Introduction
                  </h2>
                  <p className="mb-4">
                    Welcome to Growperty.com. By accessing our website and using our property listing services, you agree to be bound by these Terms and Conditions. Please read them carefully before submitting any property listings or using our platform.
                  </p>
                  <p>
                    These terms govern your use of the platform, including all features, functionalities, and services provided by Growperty.com in the regions of Noida, Greater Noida, and YEIDA.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">2. User Responsibilities</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years old to use our services.</li>
                    <li>You agree to provide accurate, current, and complete information during the registration and listing process.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You must be the legal owner of the property or have explicit written authorization from the owner to list the property on our platform.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">3. Property Listing Rules</h2>
                  <p className="mb-4">When submitting a property listing, you agree to the following rules:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All property details, including price, area, and amenities, must be factual and not misleading.</li>
                    <li>Images uploaded must be actual photographs of the property being listed. Stock photos or digitally altered images that misrepresent the property are strictly prohibited.</li>
                    <li>Listings must not contain discriminatory language or violate any local housing laws.</li>
                    <li>Growperty.com reserves the right to review, edit, or remove any listing that violates these terms without prior notice.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" /> 4. Prohibited Content
                  </h2>
                  <p className="mb-4">Users are strictly prohibited from posting:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fraudulent or fake property listings.</li>
                    <li>Content that infringes on intellectual property rights.</li>
                    <li>Malicious code, viruses, or any software intended to damage the platform.</li>
                    <li>Spam, promotional material, or links to competing services within property descriptions.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Privacy</h2>
                  <p>
                    Your privacy is important to us. By accepting these terms, you also agree to our Privacy Policy. We collect and process your personal data (including contact information) solely for the purpose of facilitating property transactions and improving our services. We implement strict security measures to protect your data and do not sell your personal information to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">6. Liability Disclaimer</h2>
                  <p className="mb-4">
                    Growperty.com acts as an intermediary platform connecting buyers and sellers. We do not guarantee the accuracy of listings provided by users.
                  </p>
                  <p>
                    We shall not be held liable for any direct, indirect, incidental, or consequential damages arising from property transactions initiated through our platform. Users are advised to conduct their own due diligence and legal verification before entering into any real estate transaction.
                  </p>
                </section>

                <section className="bg-muted/50 p-6 rounded-2xl border border-border mt-12">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> 7. Contact Information
                  </h2>
                  <p className="mb-2">If you have any questions or concerns regarding these Terms and Conditions, please contact our support team:</p>
                  <p className="font-medium text-foreground">Email: legal@growperty.com</p>
                  <p className="font-medium text-foreground">Phone: +91 9891117876</p>
                </section>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsAndConditionsPage;