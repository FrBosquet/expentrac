import { type Config } from 'tailwindcss'
import { tailwindPreset } from './lib/tailwind-preset'

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  presets: [tailwindPreset]
} satisfies Config

export default config
