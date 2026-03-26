/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Syne', 'sans-serif'],
      },
      colors: {
        bg:       '#080c10',
        bg2:      '#0d1117',
        bg3:      '#111820',
        bgdeep:   '#050810',
        accent:   '#00d9ff',
        accent2:  '#7c3aed',
        critical: '#ff4444',
        high:     '#ff8800',
        medium:   '#f0d040',
        low:      '#44aaff',
        success:  '#23d18b',
        muted:    '#6e7681',
        dim:      '#c9d1d9',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        bright:  'rgba(255,255,255,0.12)',
      },
    },
  },
  plugins: [],
}
