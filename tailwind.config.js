/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          border: 'var(--color-card-border)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        // Override default colors to use theme variables
        white: 'var(--color-card)',
        slate: {
          50: 'var(--color-muted)',
          100: 'var(--color-card-border)',
          400: 'var(--color-muted-foreground)',
          500: 'var(--color-muted-foreground)',
          600: 'var(--color-muted-foreground)',
          700: 'var(--color-card-border)',
          800: 'var(--color-card)',
          900: 'var(--color-foreground)',
          950: 'var(--color-background)',
        },
        blue: {
          50: 'var(--color-muted)',
          100: 'var(--color-muted)',
          200: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
          300: 'color-mix(in srgb, var(--color-primary) 50%, white)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-hover)',
          900: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
        },
        red: {
          50: 'color-mix(in srgb, #ef4444 5%, var(--color-card))',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
        green: {
          50: 'color-mix(in srgb, #10b981 5%, var(--color-card))',
          500: '#10b981',
          600: '#059669',
        },
        purple: {
          50: 'color-mix(in srgb, #a855f7 5%, var(--color-card))',
          500: '#a855f7',
        },
        sky: {
          50: 'color-mix(in srgb, #0ea5e9 5%, var(--color-card))',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          900: 'color-mix(in srgb, #0ea5e9 20%, transparent)',
        },
        gray: {
          50: 'var(--color-muted)',
          100: 'var(--color-card-border)',
          400: 'var(--color-muted-foreground)',
          700: 'var(--color-card-border)',
          800: 'var(--color-card)',
          900: 'var(--color-foreground)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
