/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Indian Flag — Elegant Minimal ──
        saffron: { 50:'#FFF8F0',100:'#FFECD9',200:'#FFD9B3',300:'#FFB347',400:'#FF8C00',500:'#FF6B00',600:'#E65C00',700:'#CC5200' },
        navy:    { 50:'#EEF0FB',100:'#C5CAE9',200:'#9FA8DA',300:'#7986CB',400:'#5C6BC0',500:'#3949AB',600:'#283593',700:'#1A237E',800:'#0F1935',900:'#080D1A' },
        india:   { 400:'#4CAF50',500:'#138808',600:'#0D6E06' },
        // Alias tokens (keep old names working)
        coral:   { 400:'#FF8C00',500:'#FF6B00',600:'#E65C00' },
        orange:  { 400:'#FF8C00',500:'#FF6B00',600:'#E65C00' },
        lime:    { 400:'#FFB347',500:'#FF8C00',600:'#FF6B00' },
        cyan:    { 400:'#7986CB',500:'#5C6BC0',600:'#3949AB' },
        pink:    { 400:'#9FA8DA',500:'#7986CB',600:'#5C6BC0' },
        purple:  { 400:'#9FA8DA',500:'#7986CB',600:'#5C6BC0' },
        yellow:  { 400:'#FFB347',500:'#FF8C00',600:'#FF6B00' },
        void:    { 900:'#080D1A',800:'#0F1628',700:'#172035',600:'#1E2D48',500:'#253555' },
        brand:   { 400:'#FF8C00',500:'#FF6B00',600:'#E65C00' },
        accent:  { 400:'#5C6BC0',500:'#3949AB',600:'#283593' },
      },
      backgroundImage: {
        'grad-fire':  'linear-gradient(135deg, #E65C00, #FF6B00)',
        'grad-navy':  'linear-gradient(135deg, #1A237E, #3949AB)',
        'grad-brand': 'linear-gradient(135deg, #FF6B00, #FF8C00)',
      },
      borderRadius: { '2xl':'1rem','3xl':'1.5rem','4xl':'2rem' },
      boxShadow: {
        'xs':        '0 1px 2px rgba(0,0,0,0.05)',
        'sm':        '0 1px 3px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        'md':        '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
        'lg':        '0 8px 24px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.08)',
        'saffron':   '0 4px 16px rgba(255,107,0,0.28)',
        'navy':      '0 4px 16px rgba(57,73,171,0.28)',
        card:        '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.12), 0 20px 40px rgba(0,0,0,0.08)',
        'glow-fire':   '0 0 20px rgba(255,107,0,0.5), 0 0 40px rgba(255,107,0,0.2)',
        'glow-navy':   '0 0 20px rgba(57,73,171,0.5), 0 0 40px rgba(57,73,171,0.2)',
      },
      animation: {
        shimmer:          'shimmer 2s linear infinite',
        float:            'float 4s ease-in-out infinite',
        'fade-in':        'fadeIn 0.35s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'pulse-3d':       'pulse3d 2.5s ease-in-out infinite',
        ripple:           'ripple 0.6s linear',
      },
      keyframes: {
        shimmer:       { '0%':{backgroundPosition:'-200% 0'},'100%':{backgroundPosition:'200% 0'} },
        float:         { '0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'} },
        fadeIn:        { '0%':{opacity:0},'100%':{opacity:1} },
        slideUp:       { '0%':{transform:'translateY(10px)',opacity:0},'100%':{transform:'translateY(0)',opacity:1} },
        gradientShift: { '0%,100%':{backgroundPosition:'0% 50%'},'50%':{backgroundPosition:'100% 50%'} },
        pulse3d:       { '0%,100%':{transform:'scale(1) rotateX(0deg)',boxShadow:'0 4px 20px rgba(255,107,0,0.3)'},'50%':{transform:'scale(1.04) rotateX(2deg)',boxShadow:'0 8px 32px rgba(255,107,0,0.5)'} },
        ripple:        { '0%':{transform:'scale(0)',opacity:0.6},'100%':{transform:'scale(4)',opacity:0} },
      },
    },
  },
  plugins: [],
}
