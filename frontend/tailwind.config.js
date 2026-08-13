/** @type {import('tailwindcss').Config} */
const { AppColors } = require('./colors.js');

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
            DEFAULT: AppColors.primary, 
            dark: AppColors.primaryDark
          },
        secondary: {
          DEFAULT: AppColors.secondary, 
        },    
        dark: {
          DEFAULT: AppColors.primaryDark, 
        },    
        accent: {
          DEFAULT: AppColors.accent, 
        },    
        light: {
          DEFAULT: AppColors.light, 
        },    
        white: AppColors.white,    
      }
    },
  },
  plugins: [],
}
