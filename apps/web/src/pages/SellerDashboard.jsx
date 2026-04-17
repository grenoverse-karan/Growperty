import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MessageSquare, User, BarChart3, PlusCircle, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { getFeaturedProperties } = useProperties();
  const [activeTab, setActiveTab] = useState('listings');
  
  // Mock data for demonstration
  const myProperties = getFeaturedProperties().slice(0, 3);
  const inquiries = [
    { id: 1, property: 'Luxury 3 BHK Flat in Sector 150', buyer: 'Rahul Sharma', phone: '+91 98765 43210', date: 'Today, 10:30 AM' },
    { id: 2, property: 'Spacious 4 BHK Villa in Jaypee Greens', buyer: 'Priya Singh', phone: '+91 98765 12345', date: 'Yesterday' },
  ];

  return (
    <>
      <Helmet>
        <title>Seller Dashboard - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Seller Dashboard
                </h1>
                <p className="text-muted-foreground font-medium mt-2">
                  Manage your listings, view analytics, and respond to inquiries.
                </p>
              </div>
              <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md" asChild>
                <Link to="/list-property">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Listing
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Listings</p>
                    <p className="text-3xl font-extrabold text-foreground">3</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl">
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Views</p>
                    <p className="text-3xl font-extrabold text-foreground">1,248</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 bg-amber-500/10 rounded-2xl">
                    <MessageSquare className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">New Inquiries</p>
                    <p className="text-3xl font-extrabold text-foreground">12</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-white dark:bg-slate-900 border border-border/50 p-1 rounded-xl h-auto flex-wrap justify-start gap-2">
                <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <Building2 className="h-4 w-4 mr-2" /> My Listings
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <MessageSquare className="h-4 w-4 mr-2" /> Inquiries
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <User className="h-4 w-4 mr-2" /> Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myProperties.map((property) => (
                    <div key={property.id} className="relative group">
                      <PropertyCard property={property} />
                      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-white/90 hover:bg-white text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="rounded-full shadow-md">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="inquiries" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Inquiries</CardTitle>
                    <CardDescription>Potential buyers who have contacted you.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50 gap-4">
                          <div>
                            <p className="font-bold text-foreground text-lg">{inquiry.property}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground font-medium">
                              <span className="flex items-center"><User className="h-4 w-4 mr-1" /> {inquiry.buyer}</span>
                              <span className="flex items-center"><TrendingUp className="h-4 w-4 mr-1" /> {inquiry.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <a href={`tel:${inquiry.phone.replace(/\s/g, '')}`} className="btn-call px-4 py-2 rounded-lg font-bold text-sm flex items-center">
                              Call {inquiry.phone}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Track how your listings are performing over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-xl m-6 border border-border/50">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-bold">Analytics Dashboard</p>
                      <p className="text-sm">Detailed charts will appear here once you have more data.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm max-w-2xl">
                  <CardHeader>
                    <CardTitle>Seller Profile</CardTitle>
                    <CardDescription>Update your contact information visible to buyers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold">Full Name / Agency Name</Label>
                      <Input id="name" defaultValue={user?.name} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold">Email Address</Label>
                      <Input id="email" defaultValue={user?.email} disabled className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-muted-foreground cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold">Public Phone Number</Label>
                      <Input id="phone" placeholder="Add phone number for buyers" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                    </div>
                    <Button className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SellerDashboard;