import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryScene } from './LibraryScene';
import { IntroOverlay } from './IntroOverlay';

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [started, setStarted] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleEnter = useCallback(() => {
    setStarted(true);
    // Sequence: 
    // 1. Started=true triggers Camera Zoom (LibraryScene) and IntroOverlay exit.
    // 2. Wait a bit, then show "Welcome" text (setExiting=true to trigger welcome phase).
    // 3. Wait more, then finish intro (onComplete).

    setTimeout(() => {
      setExiting(true); // Re-purposing 'exiting' to mean "Show Welcome Phase"

      setTimeout(() => {
        onComplete();
      }, 2000); // Allow Welcome text to be seen for 2s
    }, 800); // Start Welcome text appearing while zooming
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />

      {/* 3D Scene - Always mounted until entire component unmounts */}
      <div className="absolute inset-0">
        <LibraryScene started={started} />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)',
          opacity: 0.4,
        }}
      />

      {/* Initial Intro Overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="absolute inset-0 z-20"
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
          >
            <IntroOverlay onComplete={handleEnter} started={started} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Text Overlay - Comes from "inside" (scale up) */}
      <AnimatePresence>
        {exiting && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, z: -100 }} // Start small/far
              animate={{ scale: 1, opacity: 1, z: 0 }} // Zoom in
              exit={{ scale: 1.2, opacity: 0 }} // Continue zooming out/fading
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <h1 className="font-display text-5xl md:text-7xl font-bold text-primary text-glow drop-shadow-2xl">
                Welcome
              </h1>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
