import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme matching original Deal Radar design
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#f97316', // orange-500
          dark: '#ea580c',    // orange-600
        },
        surface: {
          DEFAULT: '#1e1e2e',
          raised: '#2a2a3e',
          overlay: '#313145',
        },
      },
    },
  },
  plugins: [],
}

export default config
