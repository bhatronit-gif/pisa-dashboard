/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // High fidelity PISA colors from app.py / palette.md guidelines
        thakur: '#6366F1',     // Indigo
        malad: '#14B8A6',      // Teal
        ashok: '#8B5CF6',      // Violet
        oecd: '#9CA3AF',       // Muted Gray
        singapore: '#F43F5E',  // Coral Red
        girls: '#EC4899',      // Pink
        boys: '#3B82F6',       // Blue
        cags: '#4F46E5',       // Deep Indigo
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
