/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#421cc8',
          dark: '#7c5dfa',
        },
        secondary: {
          light: '#1f6b45',
          dark: '#24a568',
        },
        surface: {
          light: '#f9f9fd',
          dark: '#131313',
        },
        card: {
          light: '#ffffff',
          dark: '#1c1b1b',
        },
        content: {
          light: '#1a1c1f',
          dark: '#e5e2e1',
        },
        muted: '#787587',
        outline: '#c9c4d8',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
      },
    },
  },
  plugins: [],
}