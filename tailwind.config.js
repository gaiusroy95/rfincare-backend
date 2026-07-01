/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', // gray-300
        input: 'var(--color-input)', // gray-300
        ring: 'var(--color-ring)', // blue-900
        background: 'var(--color-background)', // gray-50
        foreground: 'var(--color-foreground)', // gray-900
        primary: {
          DEFAULT: 'var(--color-primary)', // blue-900
          foreground: 'var(--color-primary-foreground)', // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // medium-slate-blue
          foreground: 'var(--color-secondary-foreground)', // white
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-600
          foreground: 'var(--color-destructive-foreground)', // white
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // gray-100
          foreground: 'var(--color-muted-foreground)', // gray-600
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // orange-red
          foreground: 'var(--color-accent-foreground)', // white
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // white
          foreground: 'var(--color-popover-foreground)', // gray-900
        },
        card: {
          DEFAULT: 'var(--color-card)', // white
          foreground: 'var(--color-card-foreground)', // gray-900
        },
        success: {
          DEFAULT: 'var(--color-success)', // green-600
          foreground: 'var(--color-success-foreground)', // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // yellow-600
          foreground: 'var(--color-warning-foreground)', // gray-900
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-600
          foreground: 'var(--color-error-foreground)', // white
        },
        customer: {
          primary: 'var(--color-customer-primary)', // indigo-500
          foreground: 'var(--color-customer-foreground)', // white
        },
        agent: {
          primary: 'var(--color-agent-primary)', // pink-500
          foreground: 'var(--color-agent-foreground)', // white
        },
        admin: {
          primary: 'var(--color-admin-primary)', // amber-500
          foreground: 'var(--color-admin-foreground)', // gray-900
        },
        employee: {
          primary: 'var(--color-employee-primary)', // blue-500
          foreground: 'var(--color-employee-foreground)', // white
        },
        conversion: {
          DEFAULT: 'var(--color-conversion)', // emerald-500
          foreground: 'var(--color-conversion-foreground)', // white
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        headline: ['var(--font-headline)'],
        body: ['var(--font-body)'],
        accent: ['var(--font-accent)'],
      },
      spacing: {
        unit: 'var(--spacing-unit)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        base: 'var(--transition-base)',
        fast: 'var(--transition-fast)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'slide-in': {
          from: { transform: 'translateY(-10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { transform: 'scale(0.9)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
        'progress-fill': {
          from: { strokeDashoffset: '283' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'progress-fill': 'progress-fill 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}