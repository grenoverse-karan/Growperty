import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
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
import { Heart, Search, MessageSquare, User, Trash2, Clock } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { getFeaturedProperties } = useProperties();
  const [activeTab, setActiveTab] = useState('saved');
  
  // Mock data for demonstration
  const savedProperties = getFeaturedProperties().slice(0, 2);
  const searchHistory = [
    { id: 1, query: '3 BHK in Sector 150, Noida', date: '2 hours ago' },
    { id: 2, query: 'Villas under 2 Cr in Greater Noida', date: '1 day ago' },
    { id: 3, query: 'Commercial shops in Gurgaon', date: '3 days ago' },
  ];
  const inquiries = [
    { id: 1, property: 'Luxury 3 BHK Flat in Sector 150', status: 'Responded', date: 'Oct 12, 2023' },
    { id: 2, property: 'Spacious 4 BHK Villa in Jaypee Greens', status: 'Pending', date: 'Oct 15, 2023' },
  ];

  return (
    <>
      <Helmet>
        <title>Buyer Dashboard - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Welcome back, {user?.name || 'Buyer'}
              </h1>
              <p className="text-muted-foreground font-medium mt-2">
                Manage your saved properties, searches, and profile.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-white dark:bg-slate-900 border border-border/50 p-1 rounded-xl h-auto flex-wrap justify-start gap-2">
                <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <Heart className="h-4 w-4 mr-2" /> Saved Properties
                </TabsTrigger>
                <TabsTrigger value="searches" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <Search className="h-4 w-4 mr-2" /> Search History
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <MessageSquare className="h-4 w-4 mr-2" /> My Inquiries
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-4 font-bold">
                  <User className="h-4 w-4 mr-2" /> Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="saved" className="space-y-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {savedProperties.map((property) => (
                    <div key={property.id} className="relative group">
                      <PropertyCard property={property} />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="searches" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Searches</CardTitle>
                    <CardDescription>Quickly jump back to your previous property searches.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchHistory.map((search) => (
                        <div key={search.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Search className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{search.query}</p>
                              <p className="text-xs text-muted-foreground font-medium flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" /> {search.date}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inquiries" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Inquiry History</CardTitle>
                    <CardDescription>Track the status of properties you've inquired about.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50 gap-4">
                          <div>
                            <p className="font-bold text-foreground">{inquiry.property}</p>
                            <p className="text-sm text-muted-foreground font-medium mt-1">Inquired on {inquiry.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              inquiry.status === 'Responded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {inquiry.status}
                            </span>
                            <Button variant="outline" size="sm" className="rounded-lg font-bold">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm max-w-2xl">
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold">Full Name</Label>
                      <Input id="name" defaultValue={user?.name} className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold">Email Address</Label>
                      <Input id="email" defaultValue={user?.email} disabled className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-muted-foreground cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                      <Input id="phone" placeholder="Add phone number" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
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

export default BuyerDashboard;