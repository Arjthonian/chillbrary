import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroOverlayProps {
  onComplete: () => void;
  started: boolean;
}

export function IntroOverlay({ onComplete, started }: IntroOverlayProps) {
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 1500);
    const subtextTimer = setTimeout(() => setShowSubtext(true), 2500);
    const buttonTimer = setTimeout(() => setShowButton(true), 3500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(subtextTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />

      <div className="relative z-20 text-center px-4">
        <AnimatePresence>
          {showText && !started && (
            <motion.div
              initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4"
            >
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <span className="text-primary text-glow">Smart Library</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSubtext && !started && (
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-semibold text-foreground/90">
                Management System
              </h2>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                A next-generation digital library platform for the modern age
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButton && !started && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto"
            >
              <button
                onClick={onComplete}
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 glow-primary"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Enter Library
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer opacity-50" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <AnimatePresence>
          {!started && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={onComplete}
              className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors cursor-pointer group"
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="group-hover:text-primary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
              <span>Click to Enter</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
