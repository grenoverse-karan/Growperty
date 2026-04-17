
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';

const SelectionScreen = ({ selectedOption, onSelect }) => {
  return (
    <div className="w-full mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white mb-2">What would you like to list?</h2>
        <p className="text-muted-foreground font-medium">Choose the category that best describes your listing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
        {/* Option 1: Property */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('property')}
          className={`relative cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 border-2 ${
            selectedOption === 'property' 
              ? 'border-brand-green shadow-lg ring-4 ring-brand-green/10' 
              : 'border-border/50 shadow-sm hover:shadow-md hover:border-brand-green/50'
          }`}
        >
          {selectedOption === 'property' && (
            <div className="absolute -top-3 -right-3 bg-brand-green text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Home className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 shadow-sm border-none">
              FREE
            </Badge>
          </div>
          
          <h3 className="text-xl font-extrabold text-foreground mb-2">List Your Property</h3>
          <p className="text-muted-foreground text-sm font-medium mb-6 leading-relaxed">
            For individual owners and agents looking to sell or rent out apartments, houses, villas, or independent floors.
          </p>
          
          <Button 
            className={`w-full font-bold h-12 rounded-xl transition-all ${
              selectedOption === 'property' 
                ? 'bg-brand-green hover:bg-emerald-600 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
            }`}
            variant={selectedOption === 'property' ? 'default' : 'secondary'}
          >
            Select Property
          </Button>
        </motion.div>

        {/* Option 2: Project */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('project')}
          className={`relative cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 border-2 ${
            selectedOption === 'project' 
              ? 'border-brand-green shadow-lg ring-4 ring-brand-green/10' 
              : 'border-border/50 shadow-sm hover:shadow-md hover:border-brand-green/50'
          }`}
        >
          {selectedOption === 'project' && (
            <div className="absolute -top-3 -right-3 bg-brand-green text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-brand-blue dark:text-blue-400" />
            </div>
            <Badge className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-3 py-1 shadow-sm border-none">
              FOR BUILDERS
            </Badge>
          </div>
          
          <h3 className="text-xl font-extrabold text-foreground mb-2">List Your Project</h3>
          <p className="text-muted-foreground text-sm font-medium mb-6 leading-relaxed">
            For builders and developers to showcase entire residential or commercial projects, multiple units, and amenities.
          </p>
          
          <Button 
            className={`w-full font-bold h-12 rounded-xl transition-all ${
              selectedOption === 'project' 
                ? 'bg-brand-green hover:bg-emerald-600 text-white' 
                : 'bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
            }`}
            variant={selectedOption === 'project' ? 'default' : 'outline'}
          >
            Select Project
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SelectionScreen;
