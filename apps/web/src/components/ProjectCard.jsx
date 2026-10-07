import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MapPin, Building2, ArrowRight, ShieldCheck, Heart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { flattenPricing } from '@/lib/projectPricing.js';
import { getStatusColor, PROJECT_CITY_LABELS, shortPrice, projectTypeLabel, isReraApproved } from '@/lib/projectDisplay.js';
import { getActiveOffer, getOfferSummary } from '@/lib/offerUtils.js';
import { isProjectWishlisted, toggleProjectWishlist } from '@/lib/projectWishlist.js';
import ImageSlider from '@/components/ImageSlider.jsx';

// Cloudinary serves resized/optimised variants straight from the URL.
const cardPhoto = (url) => url.replace('/upload/', '/upload/c_fill,w_720,h_540,q_auto,f_auto/');

// Shared project card — used on the Projects grid and as a "Featured
// Projects" teaser on the Properties page. `index` only drives the
// stagger-in animation delay.
const ProjectCard = ({ project, index = 0 }) => {
  const { range } = flattenPricing(project.propertyTypePricing);
  const offer = getActiveOffer(project);
  const image = project.projectImages?.[0];

  const [isWishlisted, setIsWishlisted] = useState(() => isProjectWishlisted(project._id));

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowWishlisted = toggleProjectWishlist(project._id);
    setIsWishlisted(nowWishlisted);
    toast.success(nowWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/project/${project._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: project.projectName, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 5) * 0.08 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 border border-border/50 transition-all duration-300 flex flex-col h-full"
    >
      <Link to={`/project/${project._id}`} className="relative aspect-[4/3] overflow-hidden block">
        {image ? (
          <ImageSlider
            images={(project.projectImages || []).map(cardPhoto)}
            count={(project.projectImages || []).length}
            alt={project.projectName}
            dotsTop={14}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blue to-slate-800 flex items-center justify-center">
            <Building2 className="w-14 h-14 text-white/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <Badge className="px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider shadow-md border-none bg-slate-900/80 text-white backdrop-blur-sm flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Project
          </Badge>
          {project.projectStatus && (
            <Badge className={`px-3 py-1.5 font-bold text-xs uppercase shadow-md border-none ${getStatusColor(project.projectStatus)}`}>
              {project.projectStatus}
            </Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Add to wishlist"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share project"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Share2 className="h-4 w-4 text-slate-700" />
          </button>
        </div>
        <div className={`absolute left-0 right-0 pointer-events-none bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 ${offer ? 'bottom-7' : 'bottom-0'}`}>
          <h3 className="text-2xl font-bold text-white mb-1 leading-tight line-clamp-2">
            {project.projectName}
          </h3>
          {project.builderName && (
            <p className="text-slate-300 text-sm font-medium">by {project.builderName}</p>
          )}
        </div>
        {offer && (
          <div className="shine-badge pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white">
            <span className="text-sm leading-none">{offer.emoji}</span>
            <span className="text-xs font-extrabold tracking-wide truncate">{getOfferSummary(offer)}</span>
            <span className="text-sm leading-none">{offer.emoji}</span>
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-2 text-muted-foreground mb-3">
          <MapPin className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <span className="font-medium">
            {[project.sector, project.societyName, project.landmark, PROJECT_CITY_LABELS[project.city] || project.city].filter(Boolean).join(', ')}
          </span>
        </div>

        {isReraApproved(project) && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> RERA Approved
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Type</p>
            <p className="font-bold text-foreground text-sm">{projectTypeLabel(project)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Price</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {range ? (range.min === range.max ? shortPrice(range.min) : `${shortPrice(range.min)} – ${shortPrice(range.max)}`) : 'On request'}
            </p>
          </div>
        </div>

        {project.amenities?.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {project.amenities.slice(0, 3).map(amenity => (
                <span key={amenity} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-medium text-foreground">{amenity}</span>
              ))}
              {project.amenities.length > 3 && (
                <span className="px-3 py-1.5 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{project.amenities.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border/50">
          <Button asChild className="w-full h-12 rounded-xl font-bold bg-brand-blue hover:bg-brand-blue/90 text-white transition-all group-hover:bg-emerald-500">
            <Link to={`/project/${project._id}`}>
              View Project Details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
