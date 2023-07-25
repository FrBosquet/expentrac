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
        primary: '#6985C0',
        secondary: '#FFD37E',
        gradient: {
          start: '#799AE3',
          end: '#EDE2D3',
        }
      },
      fontFamily: {
        sans: ['__Oswald_2880cd', '__Oswald_Fallback_2880cd'],
        logo: ['__montserrat_d57222', '__montserrat_Fallback_d57222'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
