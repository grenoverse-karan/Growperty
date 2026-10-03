import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const RERADisclaimerPage = () => (
  <>
    <Helmet>
      <title>RERA Disclaimer | Growperty.com</title>
      <meta name="description" content="RERA Disclaimer for Growperty.com — Growperty does not claim RERA agent registration unless a valid registration number is expressly published on the Platform." />
    </Helmet>

    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
          </Button>

          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">RERA Disclaimer</h1>
                <p className="text-muted-foreground mt-1 font-medium text-sm">Last Updated: June 2026 · Grenoverse Multi Ventures LLP</p>
              </div>
            </div>

            <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">

              <p>
                Growperty.com is operated by <strong>Grenoverse Multi Ventures LLP</strong> as a technology-enabled property discovery and transaction-assistance platform.
              </p>

              {/* Key statement — highlighted */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-5">
                <p>
                  As of the date of this Disclaimer, <strong>Growperty / Grenoverse Multi Ventures LLP does not claim to be presently registered as a RERA real estate agent unless and until a valid registration number has been officially granted by the competent Real Estate Regulatory Authority and expressly published by the Company on the Platform.</strong> Any such registration, once obtained, shall be disclosed separately along with the relevant registration details.
                </p>
              </div>

              <p>
                Growperty may feature or facilitate discovery of properties, projects, resale opportunities, plots, rentals, or related real estate opportunities in Greater Noida, YEIDA, and other locations. Users are advised that <strong>not every property, project, or transaction displayed on the Platform may fall within the same regulatory category</strong>, and separate legal checks may be required depending on the nature of the asset and the applicable law.
              </p>

              <p>
                Where any property or project is subject to registration under applicable RERA law, the relevant promoter, seller, or authorized party remains responsible for ensuring lawful registration, accurate disclosure, and compliance with applicable advertising and project-related obligations. Growperty does not represent that every listing on the Platform is automatically RERA-registered merely because it appears on the Platform.
              </p>

              <p>
                Any project-specific RERA registration number, approval status, or regulatory disclosure shown on the Platform is based on information made available by the relevant promoter, seller, developer, public sources, or verification inputs, and should be independently verified by the user from the concerned State RERA authority or other official records before making any booking, payment, or purchase decision.
              </p>

              <div>
                <p className="mb-2">Nothing on the Platform shall be construed as:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>a representation that Growperty itself is already RERA-registered, unless specifically stated with an actual registration number;</li>
                  <li>a legal opinion that a property is fully compliant with RERA or any other law;</li>
                  <li>a substitute for independent due diligence by the buyer, investor, tenant, or seller.</li>
                </ul>
              </div>

              <p>
                Growperty is committed to improving compliance standards and may apply for, obtain, and publish relevant registrations, approvals, or disclosures as its business operations evolve. Until then, users should rely only on those regulatory details that are expressly published with supporting identification particulars.
              </p>

              <div>
                <p className="mb-2">Users should independently verify, wherever applicable:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>project RERA registration number;</li>
                  <li>promoter details;</li>
                  <li>approval and sanction status;</li>
                  <li>possession timelines;</li>
                  <li>title and encumbrance status;</li>
                  <li>authority of the seller or intermediary;</li>
                  <li>any statutory disclosures required under applicable law.</li>
                </ul>
              </div>

              <p>
                Growperty reserves the right to modify, correct, remove, or update any RERA-related statement, project disclosure, or compliance note on the Platform where additional information, verification, correction, or regulatory clarification becomes necessary.
              </p>

              {/* Avoid section */}
              <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4">
                <p className="font-bold text-red-700 dark:text-red-400 mb-2">What Growperty does NOT claim:</p>
                <ul className="list-disc pl-5 space-y-1 text-red-700 dark:text-red-300">
                  <li>"RERA approved platform"</li>
                  <li>"RERA certified Growperty"</li>
                  <li>"Government approved property platform"</li>
                  <li>"All listings RERA verified"</li>
                </ul>
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-border">
                <p className="font-bold text-foreground mb-2">Contact</p>
                <p><strong>Grenoverse Multi Ventures LLP</strong></p>
                <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a> &nbsp;·&nbsp; Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

export default RERADisclaimerPage;
