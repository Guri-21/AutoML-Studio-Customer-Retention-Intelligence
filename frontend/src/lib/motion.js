/**
 * Apple-level Motion System
 * 
 * Central motion config with physics-based springs, Apple easing curves,
 * and reusable animation presets. Every animation in the app imports from here.
 */

// ─── Apple Easing ───
export const appleEase = [0.25, 1, 0.5, 1];
export const appleEaseOut = [0.16, 1, 0.3, 1];
export const appleEaseIn = [0.4, 0, 1, 0.5];

// ─── Spring Presets (iOS-like physics) ───
export const spring = {
  // Gentle: cards, page transitions — soft landing with slight overshoot
  gentle: { type: 'spring', stiffness: 120, damping: 14, mass: 1 },
  // Snappy: buttons, small UI — quick with natural settle
  snappy: { type: 'spring', stiffness: 300, damping: 24, mass: 0.8 },
  // Bouncy: emphasis elements — noticeable overshoot
  bouncy: { type: 'spring', stiffness: 150, damping: 12, mass: 1 },
  // Heavy: large elements — weighted, deliberate
  heavy: { type: 'spring', stiffness: 100, damping: 20, mass: 1.5 },
  // Micro: tiny interactions — near-instant
  micro: { type: 'spring', stiffness: 400, damping: 30, mass: 0.5 },
};

// ─── Timing Hierarchy ───
export const timing = {
  primary: 0,      // Hero, key actions
  secondary: 0.1,  // Cards, charts
  tertiary: 0.2,   // Labels, badges
  quaternary: 0.3, // Tertiary elements
};

// ─── Fade Up (physics-based replacement) ───
export const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { ...spring.gentle },
  },
};

// ─── Scale In (grow from slightly smaller) ───
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1, scale: 1,
    transition: { ...spring.gentle },
  },
};

// ─── Slide In from left ───
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  show: {
    opacity: 1, x: 0,
    transition: { ...spring.gentle },
  },
};

// ─── Slide In from right ───
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1, x: 0,
    transition: { ...spring.gentle },
  },
};

// ─── Stagger Container ───
export const stagger = (staggerDelay = 0.06) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: timing.primary,
    },
  },
});

// ─── Card Hover (depth/lift) ───
export const cardHover = {
  whileHover: {
    y: -4,
    scale: 1.015,
    transition: { ...spring.gentle },
  },
  whileTap: {
    y: -1,
    scale: 0.985,
    transition: { ...spring.snappy },
  },
};

// ─── Button Press ───
export const buttonPress = {
  whileHover: { scale: 1.02, transition: { ...spring.micro } },
  whileTap: { scale: 0.97, transition: { ...spring.snappy } },
};

// ─── Page Transition ───
export const pageTransition = {
  initial: { opacity: 0, y: 8, scale: 0.995 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { ...spring.gentle },
  },
  exit: {
    opacity: 0, y: -6, scale: 0.995,
    transition: { duration: 0.15, ease: appleEaseIn },
  },
};

// ─── Scroll-Triggered (settles into place) ───
export const scrollReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { ...spring.heavy },
  },
};

// ─── Viewport config for scroll triggers ───
export const scrollViewport = { once: true, margin: '-80px' };
