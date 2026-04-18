/** @type {import('tailwindcss').Config} */
export default {
  // ── Purge / Content scan ──────────────────────────────────────────
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  // ── Safelist: classes built dynamically at runtime ────────────────
  // These strings are assembled in JS so Tailwind's static scanner
  // would miss them — we declare them here so they're never purged.
  safelist: [
    // Slot status colours used inline / conditionally
    'bg-parking-redDim',
    'bg-parking-greenDim',
    'bg-parking-accentDim',
    'bg-parking-purpleDim',
    'bg-parking-amberDim',
    'border-parking-red/40',
    'border-parking-accent/40',
    'border-parking-green/30',
    'border-parking-red/30',
    'border-parking-accent/30',
    'border-parking-amber/50',
    'border-parking-purple/50',
    'border-parking-accent/20',
    'text-parking-red',
    'text-parking-green',
    'text-parking-accent',
    'text-parking-amber',
    'text-parking-purple',
    'text-parking-muted',
    // Animation + stagger utilities
    'animate-fade-up',
    'animate-pop',
    'animate-pulse',
    'animate-spin',
    'stagger-1',
    'stagger-2',
    'stagger-3',
    'stagger-4',
    // Opacity-0 start state for animations
    'opacity-0',
    // Glass + glow helpers defined in index.css
    'glass',
    'glow-accent',
    'glow-green',
    'glow-red',
    'grid-bg',
    'noise-bg',
    'btn-press',
    'slot-card',
    'text-gradient',
  ],

  // ── Theme extension ───────────────────────────────────────────────
  theme: {
    extend: {
      // Custom font families
      fontFamily: {
        display: ['Syne', 'sans-serif'],          // headings — bold, geometric
        body:    ['DM Sans', 'sans-serif'],        // paragraphs — clean
        mono:    ['JetBrains Mono', 'monospace'],  // labels, code — devvy
      },

      // ── Parking colour palette ──────────────────────────────────────
      // Named "parking-*" so they read like documentation in JSX:
      //   bg-parking-accent  →  cyan highlight
      //   bg-parking-redDim  →  dark red tint for occupied cards
      colors: {
        parking: {
          bg:         '#0a0a0f',   // page background — near black
          surface:    '#12121a',   // input / secondary surface
          card:       '#1a1a26',   // card background
          border:     '#2a2a3d',   // default border
          accent:     '#6ee7f7',   // cyan — primary CTA / highlight
          accentDim:  '#1a4a52',   // dark cyan tint
          green:      '#4ade80',   // available / success
          greenDim:   '#14532d',   // dark green tint
          amber:      '#fbbf24',   // EV charging / warning
          amberDim:   '#451a03',   // dark amber tint
          red:        '#f87171',   // occupied / error
          redDim:     '#450a0a',   // dark red tint
          purple:     '#a78bfa',   // covered / feature badge
          purpleDim:  '#2e1065',   // dark purple tint
          text:       '#e2e8f0',   // primary text
          muted:      '#64748b',   // secondary / placeholder text
        },
      },

      // ── Custom animations ──────────────────────────────────────────
      animation: {
        'fade-up':    'fadeUp  0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease forwards',
        'pop':        'pop     0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px  rgba(110,231,247,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(110,231,247,0.7)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },
        pop: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
      },
    },
  },

  plugins: [],
}