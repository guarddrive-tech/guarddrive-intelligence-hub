/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#ededed',
        card: '#1a1a2e',
        'card-foreground': '#ededed',
        primary: '#00f0ff',
        'primary-foreground': '#0a0a0f',
        secondary: '#7b2fff',
        muted: '#6e7491',
        accent: '#00ff88',
        border: '#1e1e3f',
      },
    },
  },
  plugins: [],
}
