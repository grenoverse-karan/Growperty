import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ClipboardList, PenLine, PartyPopper } from 'lucide-react';

export const AI_GENERATION_STEPS = [
  { emoji: '✨', icon: Sparkles, text: 'Initializing AI...' },
  { emoji: '📋', icon: ClipboardList, text: 'Reading your form...' },
  { emoji: '✍️', icon: PenLine, text: 'Crafting description...' },
  { emoji: '🎉', icon: PartyPopper, text: 'Almost ready...' },
];

// Full-card flowing-gradient loading overlay, shared by every AI-generation
// field (property + project Description, Sector Guide, ...). The parent card
// must be `relative overflow-hidden`.
const AiGenerationOverlay = ({ active, stepIndex }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center gap-6 overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, #FF3D3D, #FF8C00, #FFD700, #FF6EC7, #9B59B6, #FF3D3D)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 8s ease infinite',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-5 text-center px-6"
          >
            {/* spinning ring */}
            <div className="relative h-24 w-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
              <span className="relative z-10" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))' }}>
                {React.createElement(AI_GENERATION_STEPS[stepIndex].icon, { className: 'h-8 w-8 text-white' })}
              </span>
            </div>
            <p
              className="text-lg font-extrabold tracking-wide text-white"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45), 0 0 20px rgba(0,0,0,0.25)' }}
            >
              {AI_GENERATION_STEPS[stepIndex].emoji} {AI_GENERATION_STEPS[stepIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* full-width white progress bar pinned to the bottom of the card */}
        <div className="absolute bottom-0 inset-x-0 z-10 h-2 bg-black/15">
          <div
            className="h-full bg-white/70 transition-all duration-500"
            style={{ width: `${((stepIndex + 1) / AI_GENERATION_STEPS.length) * 100}%` }}
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AiGenerationOverlay;
